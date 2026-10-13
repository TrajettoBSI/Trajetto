package com.trajetto.backend.itinerary.schedule;

import java.time.DayOfWeek;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Le o horario de funcionamento no formato do OpenStreetMap (tag {@code opening_hours}) e diz se o
 * lugar esta aberto numa data e hora.
 * <p>
 * Cobre o que aparece no catalogo de Roma: dias da semana ("Tu-Su"), faixas de horario
 * ("09:00-13:00,14:00-19:00", inclusive passando da meia-noite), dias fechados ("Mo off"),
 * temporadas ("Oct-May:", "Mar 16-24") e datas especiais ("Dec 24,31 09:00-14:00", "Dec 25 off").
 * Como no OSM, uma regra posterior substitui as anteriores nos dias em que vale. O que o formato
 * permite mas o catalogo quase nao usa (feriados moveis, "sunrise", comentarios como
 * "by appointment", regras de um ano especifico) e ignorado; se sobrar duvida a resposta e
 * {@link Status#UNKNOWN}, e quem chama trata o lugar como possivelmente aberto.
 */
public final class OpeningHours {

    public enum Status { OPEN, CLOSED, UNKNOWN }

    private static final String MONTHS = "Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec";
    private static final String DAYS = "Mo|Tu|We|Th|Fr|Sa|Su";
    private static final List<String> MONTH_LIST = List.of(MONTHS.split("\\|"));
    private static final List<String> DAY_LIST = List.of(DAYS.split("\\|"));

    /** Por do sol aproximado em Roma; so entra quando o horario termina em "sunset". */
    private static final int SUNSET = 19 * 60 + 30;

    private static final Pattern TIME_RANGE = Pattern.compile(
            "(\\d{1,2}):(\\d{2})\\s*-\\s*(?:(\\d{1,2}):(\\d{2})(\\+)?|(sunset))");
    private static final Pattern OPEN_END = Pattern.compile("(\\d{1,2}):(\\d{2})\\+");
    private static final Pattern OFF = Pattern.compile("\\b(off|closed)\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern WEEKDAYS = Pattern.compile(
            "\\b(" + DAYS + ")\\b(?:\\s*-\\s*(" + DAYS + ")\\b)?");
    private static final Pattern DATES = Pattern.compile(
            "\\b(" + MONTHS + ")\\b(?:\\s+(\\d{1,2})(?!\\d))?"
                    + "(?:\\s*-\\s*(?:(" + MONTHS + ")\\b\\s*)?(\\d{1,2}(?!\\d))?)?");
    private static final Pattern EXTRA_DAY = Pattern.compile("^\\s*,\\s*(\\d{1,2})(?!\\d)");
    private static final Pattern HOLIDAY_ONLY = Pattern.compile("\\s*PH\\b.*");
    private static final Pattern RULE_START = Pattern.compile("^\\s*(" + DAYS + "|" + MONTHS + ")\\b");
    private static final Pattern UNSUPPORTED = Pattern.compile(
            "[\"\\[(]|easter|sunrise|week|\\bSH\\b|\\b\\d{4}\\b", Pattern.CASE_INSENSITIVE);

    private OpeningHours() {
    }

    /** Esta aberto durante toda a visita, de {@code start} ate {@code start + stay}? */
    public static Status statusAt(String raw, LocalDate date, LocalTime start, Duration stay) {
        if (raw == null || raw.isBlank()) return Status.UNKNOWN;
        String text = raw.trim();
        if (text.equals("24/7")) return Status.OPEN;
        if (text.equalsIgnoreCase("closed") || text.equalsIgnoreCase("off")) return Status.CLOSED;

        boolean uncertain = false;
        List<int[]> intervals = List.of();

        for (String rule : splitRules(text.replace("||", ";"))) {
            if (HOLIDAY_ONLY.matcher(rule).matches()) continue;
            if (UNSUPPORTED.matcher(rule).find()) {
                uncertain = true;
                continue;
            }
            Rule parsed = Rule.parse(rule);
            if (parsed == null) {
                uncertain = true;
                continue;
            }
            if (parsed.appliesTo(date)) {
                intervals = parsed.intervals;
            }
        }

        int from = start.getHour() * 60 + start.getMinute();
        int to = from + (int) stay.toMinutes();
        for (int[] interval : intervals) {
            if (interval[0] <= from && to <= interval[1]) return Status.OPEN;
        }
        return uncertain ? Status.UNKNOWN : Status.CLOSED;
    }

    /** Separa as regras por ";" e tambem por "," quando a virgula comeca uma regra nova ("..., Su 10:00-18:00"). */
    static List<String> splitRules(String text) {
        List<String> rules = new ArrayList<>();
        for (String part : text.split(";")) {
            StringBuilder current = new StringBuilder();
            for (String piece : part.split(",")) {
                boolean startsRule = RULE_START.matcher(piece).find();
                boolean previousIsComplete = TIME_RANGE.matcher(current).find() || OFF.matcher(current).find();
                if (current.length() > 0 && startsRule && previousIsComplete) {
                    rules.add(current.toString().trim());
                    current.setLength(0);
                }
                if (current.length() > 0) current.append(',');
                current.append(piece);
            }
            if (!current.toString().isBlank()) rules.add(current.toString().trim());
        }
        return rules;
    }

    private record DateRange(int from, int to) {
        boolean contains(int ordinal) {
            return from <= to ? from <= ordinal && ordinal <= to : ordinal >= from || ordinal <= to;
        }
    }

    private static final class Rule {
        private Set<DayOfWeek> weekdays;
        private final List<DateRange> dates = new ArrayList<>();
        private List<int[]> intervals = new ArrayList<>();
        private boolean off;

        static Rule parse(String text) {
            Rule rule = new Rule();
            String rest = text;

            Matcher times = TIME_RANGE.matcher(rest);
            while (times.find()) {
                int start = minutes(times.group(1), times.group(2));
                int end;
                if (times.group(6) != null) end = SUNSET;
                else if (times.group(5) != null) end = 24 * 60;
                else end = minutes(times.group(3), times.group(4));
                if (end <= start) end += 24 * 60;
                rule.intervals.add(new int[]{start, end});
            }
            rest = TIME_RANGE.matcher(rest).replaceAll(" ");
            Matcher openEnd = OPEN_END.matcher(rest);
            while (openEnd.find()) {
                rule.intervals.add(new int[]{minutes(openEnd.group(1), openEnd.group(2)), 24 * 60});
            }
            rest = OPEN_END.matcher(rest).replaceAll(" ");

            rule.off = OFF.matcher(rest).find();
            rest = OFF.matcher(rest).replaceAll(" ");
            if (rule.off) rule.intervals = new ArrayList<>();

            boolean holidayOnly = rest.contains("PH");
            rest = rest.replace("PH", " ");

            Matcher dateMatcher = DATES.matcher(rest);
            StringBuilder withoutDates = new StringBuilder();
            int last = 0;
            while (dateMatcher.find()) {
                withoutDates.append(rest, last, dateMatcher.start());
                int month = MONTH_LIST.indexOf(dateMatcher.group(1)) + 1;
                String day = dateMatcher.group(2);
                String toMonthName = dateMatcher.group(3);
                String toDay = dateMatcher.group(4);
                boolean isRange = toMonthName != null || toDay != null;
                int toMonth = toMonthName != null ? MONTH_LIST.indexOf(toMonthName) + 1 : month;

                int from = month * 100 + (day != null ? Integer.parseInt(day) : 1);
                int to;
                if (isRange) to = toMonth * 100 + (toDay != null ? Integer.parseInt(toDay) : 31);
                else to = day != null ? from : month * 100 + 31;
                rule.dates.add(new DateRange(from, to));

                int end = dateMatcher.end();
                Matcher extra = EXTRA_DAY.matcher(rest.substring(end));
                while (day != null && !isRange && extra.find()) {
                    int ordinal = month * 100 + Integer.parseInt(extra.group(1));
                    rule.dates.add(new DateRange(ordinal, ordinal));
                    end += extra.end();
                    extra = EXTRA_DAY.matcher(rest.substring(end));
                }
                last = end;
                dateMatcher.region(end, rest.length());
            }
            withoutDates.append(rest.substring(last));
            rest = withoutDates.toString();

            Matcher dayMatcher = WEEKDAYS.matcher(rest);
            while (dayMatcher.find()) {
                if (rule.weekdays == null) rule.weekdays = EnumSet.noneOf(DayOfWeek.class);
                int first = DAY_LIST.indexOf(dayMatcher.group(1));
                int lastDay = dayMatcher.group(2) != null ? DAY_LIST.indexOf(dayMatcher.group(2)) : first;
                for (int i = first; ; i = (i + 1) % 7) {
                    rule.weekdays.add(DayOfWeek.of(i + 1));
                    if (i == lastDay) break;
                }
            }
            rest = WEEKDAYS.matcher(rest).replaceAll(" ");

            if (holidayOnly && rule.weekdays == null && rule.dates.isEmpty()) return null;
            if (!rule.off && rule.intervals.isEmpty()) return null;
            if (!rest.replaceAll("[\\s,:\\-]", "").isEmpty()) return null;
            return rule;
        }

        boolean appliesTo(LocalDate date) {
            int ordinal = date.getMonthValue() * 100 + date.getDayOfMonth();
            boolean dateMatches = dates.isEmpty() || dates.stream().anyMatch(r -> r.contains(ordinal));
            boolean dayMatches = weekdays == null || weekdays.contains(date.getDayOfWeek());
            // "Mo, Jan 1, Dec 25 off": numa regra de folga, dias e datas listados somam, nao se cruzam.
            if (off && weekdays != null && !dates.isEmpty()) {
                return weekdays.contains(date.getDayOfWeek()) || dates.stream().anyMatch(r -> r.contains(ordinal));
            }
            return dateMatches && dayMatches;
        }

        private static int minutes(String hours, String minutes) {
            return Integer.parseInt(hours) * 60 + Integer.parseInt(minutes);
        }
    }
}
