package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.planning.ItineraryPlanner;
import com.trajetto.backend.itinerary.planning.TripPreferences;
import com.trajetto.backend.itinerary.planning.TripPreferences.Placement;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Stream;

/**
 * Interpretador por palavras-chave, sem servico externo. Entende, em portugues, ingles e
 * espanhol, categorias ("mais museus", "sem igrejas"), preco ("so gratis"), ritmo ("com calma"),
 * caminhada ("menos caminhada"), trocas ("troca o Coliseu pelo Pantheon") e os lugares do
 * catalogo citados pelo nome, com dia e periodo ("Fontana di Trevi no ultimo dia, de manha").
 *
 * <p>O pedido e quebrado em trechos. Cada trecho e negativo ou positivo conforme as palavras que
 * tiver; sem nenhuma delas, herda do trecho anterior: em "menos igrejas e museus", os museus
 * tambem sao "menos". "Mas" e o fim da frase voltam ao positivo.</p>
 */
final class RuleBasedInterpreter {

    private RuleBasedInterpreter() {}

    /** O que o viajante pediu e o roteiro nao faz, mas merece uma resposta em vez de silencio. */
    enum Notice { MEALS, START_TIME }

    /** Marca no texto o lugar de um nome citado, para o nome nao ser lido como palavra-chave. */
    private static final char MENTION = '\uE000';

    private static final Pattern SEPARATOR = Pattern.compile(
            "[,.;!?\\n]|\\s+(?:e|mas|and|but|y|pero)\\s+|(?=\\s(?:mais|menos|more|less|fewer|sem|sin|without)\\s)");
    private static final Pattern RESET = Pattern.compile("[.;!?\\n]|\\b(?:mas|but|pero)\\b");

    private static final Pattern WEEKDAY = Pattern.compile("\\b(?:segunda|terca|quarta|quinta|sexta)[- ]?feira\\b");
    private static final Pattern PHOTOS = Pattern.compile(
            "\\b(?:tirar|tira|tire|take|sacar)\\s+(?:umas?\\s+|as\\s+|muitas\\s+|mais\\s+|some\\s+|more\\s+)?(fotos?|photos?|pictures?)\\b");
    /** "Nao quero mais igrejas": o "mais" aqui nega, nao pede mais. */
    private static final Pattern NO_MORE = Pattern.compile(
            "\\b(?:nao\\s+(?:quero|preciso|aguento)(?:\\s+ver)?\\s+mais|no\\s+quiero\\s+(?:ver\\s+)?mas|no\\s+mas|no\\s+more"
                    + "|don'?t\\s+want\\s+(?:to\\s+see\\s+)?(?:any\\s+)?more)\\b");
    /** "Nao tira os museus": duas negacoes pedem para ficar. */
    private static final Pattern KEEP = Pattern.compile(
            "\\b(?:nao|no|don'?t|do\\s+not)\\s+(?:tira\\w*|tire\\w*|remov\\w*|retir\\w*|corta\\w*|exclu\\w*|quit\\w*|skip)\\b");
    private static final Pattern SWAP = Pattern.compile(
            "\\b(?:troc\\w*|troqu\\w*|substitu\\w*|swap\\w*|replace\\w*|cambi\\w*|change)\\s+(.+?)\\s+(?:por|pelo|pela|pelos|pelas|with|for)\\s+([^,.;!?\\n]+)");
    private static final Pattern INSTEAD = Pattern.compile(
            "\\b(?:em\\s+vez\\s+d[eao]s?|ao\\s+inves\\s+d[eao]s?|no\\s+lugar\\s+d[eao]s?|instead\\s+of|en\\s+vez\\s+de|en\\s+lugar\\s+de)\\s+([^,.;!?\\n]+)");

    private static final List<String> NEGATIVE = List.of(
            "menos", "sem", "nada de", "evitar", "evite", "evita", "nao", "odeio", "detesto", "dispenso", "chega de",
            "cansei", "cansada", "cansado", "enjoei", "tira", "tire", "tirar", "retir*", "remov*", "exclu*",
            "corta", "corte", "cortar", "pula", "pule", "pular", "troc*", "troqu*", "substitu*",
            "less", "fewer", "without", "avoid*", "don't", "dont", "not", "hate", "dislike", "skip", "drop", "replace*",
            "sin", "no quiero", "odio", "basta de", "quita*", "quite", "saca", "sacar", "no me gusta*");
    /** "no churches", "no iglesias": no portugues, "no" vem sempre com o singular ("no museu"). */
    private static final Pattern NO_PLURAL = Pattern.compile("\\bno\\s+[a-z]+s\\b");
    /** "Coliseu nao", "Pantheon fora". */
    private static final Pattern NEGATED_AFTER = Pattern.compile("^\\s*(?:nao|fora)\\b");

    private static final List<String> POSITIVE = List.of(
            "mais", "more", "quero", "quiero", "want", "gostaria", "gosto", "adoro", "amo", "love", "like", "me gusta*",
            "sim", "yes", "coloca*", "bota*", "adiciona*", "inclui*", "incluye*", "add", "agrega*", "prefiro",
            "prefer*", "so", "solo", "only", "apenas", "somente", "ver", "visitar", "visit");

    private static final List<String> FREE = List.of(
            "gratis", "gratuit*", "de graca", "barat*", "economi*", "sem gastar", "sem pagar", "sem custo",
            "orcamento", "free", "cheap*", "budget", "sin gastar", "sin pagar", "sin costo");
    private static final Pattern PAID_WORD = Pattern.compile("\\b(?:pag[oa]s?|pagad[oa]s?|pagar|paid|de pago)\\b");
    private static final Pattern PAID_OK = Pattern.compile(
            "\\b(?:(?:nao\\s+precisa(?:\\s+ser)?|sem\\s+ser|no\\s+tiene\\s+que\\s+ser|doesn'?t\\s+have\\s+to\\s+be|don'?t\\s+have\\s+to\\s+be)"
                    + "\\s+(?:so\\s+)?(?:gratis|gratuit\\w*|free)|pode\\s+gastar|pode\\s+ser\\s+caro|can\\s+spend|puedo\\s+gastar)\\b");

    private static final List<String> SLOW = List.of(
            "calm*", "tranquil*", "devagar", "relax*", "descans*", "sem pressa", "sem correria", "slow*", "chill*",
            "no rush", "sin prisa", "despacio", "ritmo leve", "mais leve", "dia leve", "dias leves", "roteiro leve", "algo leve", "bem leve");
    private static final List<String> FAST = List.of(
            "intens*", "corrid*", "correria", "maximo", "aproveitar tudo", "muita coisa", "packed", "busy");

    private static final Pattern WALK_LESS = Pattern.compile(
            "\\b(?:menos\\s+(?:caminhada|caminhar|andar|caminata|caminar)|(?:caminhar|andar|caminar)\\s+(?:menos|pouco)"
                    + "|nao\\s+(?:quero\\s+)?(?:andar|caminhar)(?:\\s+muito)?|sem\\s+andar\\s+muito|caminhadas?\\s+curtas?"
                    + "|encurta\\w*|mais\\s+perto|mais\\s+proxim\\w+|lugares\\s+(?:perto|proxim\\w+)|perto\\s+uns?\\s+d\\w+\\s+outros?"
                    + "|mais\\s+compacto|nao\\s+(?:muito\\s+)?longe|less\\s+walking|walk\\s+less|shorter\\s+walks?|closer(?:\\s+together)?"
                    + "|close\\s+together|mas\\s+cerca|menos\\s+lejos)\\b");
    private static final Pattern WALK_ANY = Pattern.compile(
            "\\b(?:pode\\s+(?:andar|caminhar)(?:\\s+mais)?|(?:andar|caminhar)\\s+mais|nao\\s+me\\s+importo\\s+de\\s+(?:andar|caminhar)"
                    + "|pode\\s+ser\\s+longe|mais\\s+longe|walk\\s+more|walking\\s+is\\s+fine|don'?t\\s+mind\\s+walking"
                    + "|puedo\\s+caminar|caminar\\s+mas)\\b");

    private static final Pattern START_LATER = Pattern.compile(
            "\\b(?:comec\\w+\\s+(?:mais\\s+)?tarde|acordar\\s+(?:mais\\s+)?tarde|dormir\\s+(?:ate\\s+)?(?:mais\\s+)?tarde"
                    + "|start\\s+later|wake\\s+up\\s+later|sleep\\s+in|empezar\\s+mas\\s+tarde|levantarme\\s+(?:mas\\s+)?tarde)\\b");
    private static final Pattern STREET_FOOD = Pattern.compile("comida de rua|street food|comida callejera");
    private static final List<String> MEALS = List.of(
            "restaurante*", "restaurant*", "comer", "comida*", "pizza*", "jantar", "almoco", "almocar", "cafe", "cafeteria*",
            "gelato*", "sorvete*", "lanche*", "gastronom*", "lunch", "dinner", "breakfast", "food", "eat", "almuerzo", "cena", "helado*");

    /** Trechos que tem "sem" ou "menos", mas nao falam de categoria: "museus sem pressa" nao e "menos museus". */
    private static final Pattern NEUTRAL = Pattern.compile(
            "\\b(?:sem pressa|sem correria|sin prisa|no rush|sem gastar|sem pagar|sem custo|sin gastar|sin pagar|sin costo)\\b");

    private static final Pattern LAST_DAY = Pattern.compile("\\b(?:ultimo|last)\\s+(?:dia|day)\\b");
    private static final Pattern BEFORE_LAST_DAY = Pattern.compile("\\b(?:penultimo|second to last)\\s+(?:dia|day)\\b");
    private static final Pattern ORDINAL_DAY = Pattern.compile(
            "\\b(primeiro|primer|first|segundo|second|terceiro|tercer|third|quarto|cuarto|fourth|quinto|fifth"
                    + "|sexto|sixth|setimo|septimo|seventh)\\s+(?:dia|day)\\b");
    private static final Pattern NUMBERED_DAY = Pattern.compile("\\b(?:dia|day)\\s+(\\d{1,2})\\b");
    private static final Map<String, Integer> ORDINALS = Map.ofEntries(
            Map.entry("primeiro", 1), Map.entry("primer", 1), Map.entry("first", 1),
            Map.entry("segundo", 2), Map.entry("second", 2),
            Map.entry("terceiro", 3), Map.entry("tercer", 3), Map.entry("third", 3),
            Map.entry("quarto", 4), Map.entry("cuarto", 4), Map.entry("fourth", 4),
            Map.entry("quinto", 5), Map.entry("fifth", 5),
            Map.entry("sexto", 6), Map.entry("sixth", 6),
            Map.entry("setimo", 7), Map.entry("septimo", 7), Map.entry("seventh", 7));

    /** Palavra do nome de um lugar que, sozinha, ja identifica o lugar ("trevi", "coliseu"). */
    private static final int MIN_KEYWORD = 5;
    /**
     * Palavra que aparece em varios nomes vale para o mais popular deles, se ele for ao menos
     * tantas vezes mais popular que o segundo: "trevi" e a fonte, nao a rua ao lado.
     */
    private static final int DOMINANT_POPULARITY = 3;

    /** Palavras comuns em nomes de lugares e nos pedidos: sozinhas, nao identificam lugar nenhum. */
    private static final Set<String> GENERIC = Set.of(
            "piazza", "plaza", "praca", "place", "square", "fontana", "fonte", "fuente", "fontaine", "fountain", "ponte", "puente",
            "bridge", "chiesa", "santa", "santo", "saint", "villa", "parco", "palazzo", "porta", "torre", "tower", "grande",
            "great", "royal", "national", "nacional", "central", "centro", "center", "centre", "street", "calle", "avenida", "avenue",
            "largo", "campo", "monte", "isola", "north", "south", "norte", "lugar", "lugares", "local", "quero", "quiero",
            "menos", "muito", "mucho", "outro", "outra", "sobre", "depois", "despues", "antes", "before", "after",
            "gente", "cidade", "ciudad", "visita", "visit", "visitar", "roteiro", "viagem", "viaje", "travel",
            "primeiro", "primer", "first", "segundo", "second", "terceiro", "third", "quarto", "quinto", "ultimo", "tarde",
            "noite", "noche", "night", "manha", "manana", "morning", "calma", "tranquilo", "tranquila", "perto", "cerca", "longe",
            "lejos", "gostaria", "gosto", "comer", "comida", "fotos", "ritmo", "caminhada", "caminata", "andar", "caminhar",
            "caminar", "ainda", "coisa", "coisas", "cosas", "pessoa", "tempo", "tiempo", "mundo", "world", "todos", "todas", "alguns",
            "algumas", "algum", "alguma", "nosso", "nossa", "gratis", "gratuito", "gratuita", "barato", "barata", "famoso", "famosa",
            "bonito", "bonita", "linda", "lindo", "antigo", "antiga", "nuevo", "nueva");

    private static final Pattern LEADING_ARTICLE = Pattern.compile("^(?:a|o|as|os|the|la|le|el|los|las|les)\\s+");

    private record Mention(CatalogPlace place, int start, int end) {}

    private record Clause(String text, boolean reset) {}

    static TripPreferences interpret(String request) {
        return interpret(request, List.of());
    }

    static TripPreferences interpret(String request, List<CatalogPlace> places) {
        return interpret(request, places, "pt");
    }

    /**
     * @param places   lugares do catalogo da cidade, para achar os citados pelo nome
     * @param language pt, en ou es: o idioma do resumo
     */
    static TripPreferences interpret(String request, List<CatalogPlace> places, String language) {
        String text = prepare(request);
        List<Mention> mentions = findPlaces(text, places);
        String withoutPlaces = blank(text, mentions);

        Matcher paidOk = PAID_OK.matcher(withoutPlaces);
        boolean allowPaid = paidOk.find();
        String rest = paidOk.replaceAll(" ");
        boolean avoidPaid = FREE.stream().anyMatch(w -> has(rest, w));
        String walking = WALK_ANY.matcher(rest).find() ? TripPreferences.WALK_ANY
                : WALK_LESS.matcher(rest).find() ? TripPreferences.WALK_LESS : "";
        String pace = SLOW.stream().anyMatch(w -> has(rest, w)) ? "LEVE" : has(rest, "equilibr*") ? "EQUILIBRADO" : "";

        String keywords = WALK_ANY.matcher(WALK_LESS.matcher(NEUTRAL.matcher(rest).replaceAll(" ")).replaceAll(" ")).replaceAll(" ");
        Set<String> more = new LinkedHashSet<>();
        Set<String> less = new LinkedHashSet<>();
        boolean negative = false;
        for (Clause clause : clauses(keywords)) {
            if (clause.reset()) negative = false;
            String c = clause.text();
            if (isNegative(c)) negative = true;
            else if (POSITIVE.stream().anyMatch(w -> has(c, w))) negative = false;

            final boolean isLess = negative;
            for (TravelCategories.Category category : TravelCategories.ALL) {
                if (category.words().stream().anyMatch(w -> has(c, w))) (isLess ? less : more).add(category.id());
            }
            if (PAID_WORD.matcher(c).find()) {
                if (isLess) avoidPaid = true;
                else allowPaid = true;
            }
            if (pace.isEmpty() && FAST.stream().anyMatch(w -> has(c, w))) pace = isLess ? "LEVE" : "INTENSO";
            // A negacao era do lugar citado no trecho: "tira o Pantheon, museus" nao tira museus.
            if (c.indexOf(MENTION) >= 0) negative = false;
        }
        more.removeAll(less);
        if (allowPaid) avoidPaid = false;

        List<String> include = new ArrayList<>();
        List<String> exclude = new ArrayList<>();
        List<Placement> placements = new ArrayList<>();
        boolean previousExcluded = false;
        for (int i = 0; i < mentions.size(); i++) {
            Mention mention = mentions.get(i);
            int from = i == 0 ? 0 : mentions.get(i - 1).end();
            String between = text.substring(from, mention.start());
            String before = NEUTRAL.matcher(clauseBefore(between)).replaceAll(" ");
            boolean last = i == mentions.size() - 1;
            String after = text.substring(mention.end(), last ? text.length() : mentions.get(i + 1).start());
            String around = " " + before + " " + (last ? after : clauseAfter(after)) + " ";
            int day = day(around);
            String period = period(around);
            boolean continuesList = previousExcluded && !RESET.matcher(between).find()
                    && POSITIVE.stream().noneMatch(w -> has(" " + between + " ", w));
            String name = mention.place().name();
            if (isNegative(before) || NEGATED_AFTER.matcher(after).find() || continuesList) {
                exclude.add(name);
                previousExcluded = true;
                continue;
            }
            previousExcluded = false;
            if (day != 0 || !period.isEmpty()) placements.add(new Placement(name, day, period));
            else include.add(name);
        }

        TripPreferences prefs = new TripPreferences(new ArrayList<>(more), new ArrayList<>(less), avoidPaid, pace,
                include, exclude, "", placements, allowPaid, walking);
        Map<String, CatalogPlace> byName = new HashMap<>();
        mentions.forEach(m -> byName.put(m.place().name(), m.place()));
        return prefs.withSummary(AssistantMessages.understood(prefs, language, name -> localName(byName.get(name), name, language)));
    }

    /** Pedidos que o roteiro nao atende, para responder em vez de ignorar. */
    static List<Notice> notices(String request, List<CatalogPlace> places) {
        String text = prepare(request);
        String withoutPlaces = blank(text, findPlaces(text, places));
        List<Notice> notices = new ArrayList<>();
        String noStreetFood = STREET_FOOD.matcher(withoutPlaces).replaceAll(" ");
        if (MEALS.stream().anyMatch(w -> has(noStreetFood, w))) notices.add(Notice.MEALS);
        if (START_LATER.matcher(withoutPlaces).find()) notices.add(Notice.START_TIME);
        return notices;
    }

    /** Sem acento e sem as construcoes que enganariam a leitura por palavras-chave. */
    private static String prepare(String request) {
        String text = " " + ItineraryPlanner.normalize(request) + " ";
        text = WEEKDAY.matcher(text).replaceAll(" ");
        text = PHOTOS.matcher(text).replaceAll("$1");
        text = NO_MORE.matcher(text).replaceAll("sem");
        text = KEEP.matcher(text).replaceAll("quero");
        text = SWAP.matcher(text).replaceAll("sem $1 , quero $2 ");
        text = INSTEAD.matcher(text).replaceAll(" , sem $1 , quero ");
        return text;
    }

    private static String blank(String text, List<Mention> mentions) {
        StringBuilder blanked = new StringBuilder(text);
        for (Mention m : mentions) {
            for (int i = m.start(); i < m.end(); i++) blanked.setCharAt(i, MENTION);
        }
        return blanked.toString();
    }

    private static List<Clause> clauses(String text) {
        List<Clause> clauses = new ArrayList<>();
        Matcher separator = SEPARATOR.matcher(text);
        int start = 0;
        boolean reset = true;
        while (separator.find()) {
            clauses.add(new Clause(" " + text.substring(start, separator.start()).trim() + " ", reset));
            reset = RESET.matcher(separator.group()).find();
            start = separator.end();
        }
        clauses.add(new Clause(" " + text.substring(start).trim() + " ", reset));
        return clauses;
    }

    private static boolean isNegative(String clause) {
        return NEGATIVE.stream().anyMatch(w -> has(clause, w)) || NO_PLURAL.matcher(clause).find();
    }

    /**
     * Lugares citados: pelo nome inteiro (em qualquer idioma do catalogo) ou por uma palavra do
     * nome que o identifica na cidade. Entre citacoes sobrepostas, vale a mais longa. Refeicoes
     * nao entram: o roteiro nao as usa como parada.
     */
    private static List<Mention> findPlaces(String text, List<CatalogPlace> places) {
        if (places == null || places.isEmpty()) return List.of();
        List<CatalogPlace> byPopularity = places.stream()
                .filter(place -> !ItineraryPlanner.MEAL_CATEGORIES.contains(place.category()))
                .sorted(Comparator.comparingInt(CatalogPlace::popularity).reversed()).toList();
        Map<String, List<CatalogPlace>> byWord = new LinkedHashMap<>();
        for (CatalogPlace place : byPopularity) {
            namesOf(place).flatMap(n -> Stream.of(n.split("[^a-z0-9]+"))).distinct()
                    .forEach(w -> byWord.computeIfAbsent(w, k -> new ArrayList<>()).add(place));
        }
        List<Mention> found = new ArrayList<>();
        for (CatalogPlace place : byPopularity) {
            namesOf(place).filter(n -> n.length() >= MIN_KEYWORD && identifiesPlace(n))
                    .forEach(n -> wholeWord(text, n).ifPresent(i -> found.add(new Mention(place, i, i + n.length()))));
        }
        byWord.forEach((word, owners) -> {
            if (word.length() < MIN_KEYWORD || GENERIC.contains(word) || isCategoryWord(word)) return;
            Optional<Integer> at = wholeWord(text, word);
            if (at.isEmpty()) return;
            int start = at.get();
            if (owners.size() <= 2) {
                owners.forEach(place -> found.add(new Mention(place, start, start + word.length())));
            } else if (owners.get(0).popularity() >= DOMINANT_POPULARITY * Math.max(1, owners.get(1).popularity())) {
                found.add(new Mention(owners.get(0), start, start + word.length()));
            }
        });
        found.sort(Comparator.comparingInt((Mention m) -> m.end() - m.start()).reversed());
        List<Mention> accepted = new ArrayList<>();
        Set<CatalogPlace> seen = new HashSet<>();
        for (Mention m : found) {
            boolean overlaps = accepted.stream().anyMatch(a -> m.start() < a.end() && a.start() < m.end());
            if (!overlaps && seen.add(m.place())) accepted.add(m);
        }
        accepted.sort(Comparator.comparingInt(Mention::start));
        return accepted;
    }

    /** O fim do texto depois da ultima separacao de trechos: "quero o Coliseu, tira o " vira " tira o ". */
    private static String clauseBefore(String text) {
        Matcher split = SEPARATOR.matcher(text);
        int start = 0;
        while (split.find()) start = split.end();
        return " " + text.substring(start) + " ";
    }

    /** O que vem depois de um lugar, ate a separacao do proximo: " no dia 1 e " vira " no dia 1". */
    private static String clauseAfter(String text) {
        Matcher split = SEPARATOR.matcher(text);
        int end = text.length();
        while (split.find()) end = split.start();
        return text.substring(0, end);
    }

    /** "A Familia" nao identifica um lugar: sem o artigo, sobra uma palavra comum. */
    private static boolean identifiesPlace(String name) {
        String core = LEADING_ARTICLE.matcher(name).replaceFirst("");
        return core.contains(" ") || (!isCategoryWord(core) && !GENERIC.contains(core));
    }

    /** "museus" e "basilica" falam de categorias, nao de um lugar. */
    private static boolean isCategoryWord(String word) {
        return TravelCategories.ALL.stream().flatMap(c -> c.words().stream())
                .anyMatch(w -> has(" " + word + " ", w) || List.of(w.split(" ")).contains(word));
    }

    private static Stream<String> namesOf(CatalogPlace place) {
        Stream<String> others = place.names() == null ? Stream.empty() : place.names().values().stream();
        return Stream.concat(Stream.of(place.name()), others).map(ItineraryPlanner::normalize)
                .filter(n -> !n.isBlank()).distinct();
    }

    private static String localName(CatalogPlace place, String fallback, String language) {
        if (place == null || place.names() == null) return fallback;
        return place.names().getOrDefault(language, fallback);
    }

    private static Optional<Integer> wholeWord(String text, String word) {
        for (int i = text.indexOf(word); i >= 0; i = text.indexOf(word, i + 1)) {
            int end = i + word.length();
            boolean startOk = i == 0 || !Character.isLetterOrDigit(text.charAt(i - 1));
            boolean endOk = end >= text.length() || !Character.isLetterOrDigit(text.charAt(end));
            if (startOk && endOk) return Optional.of(i);
        }
        return Optional.empty();
    }

    /** Dia citado no trecho: 1 e o primeiro, -1 o ultimo, 0 se nao citou. */
    static int day(String text) {
        if (BEFORE_LAST_DAY.matcher(text).find()) return -2;
        if (LAST_DAY.matcher(text).find()) return -1;
        Matcher ordinal = ORDINAL_DAY.matcher(text);
        if (ordinal.find()) return ORDINALS.get(ordinal.group(1));
        Matcher numbered = NUMBERED_DAY.matcher(text);
        if (numbered.find()) return Integer.parseInt(numbered.group(1));
        return 0;
    }

    static String period(String text) {
        if (has(text, "manha") || has(text, "morning") || has(text, "manana")) return "MANHA";
        if (has(text, "tarde") || has(text, "afternoon")) return "TARDE";
        if (has(text, "noite") || has(text, "night") || has(text, "evening") || has(text, "noche")) return "NOITE";
        return "";
    }

    /**
     * O termo aparece no texto: com "*" no fim, como comeco de palavra ("museu*" casa com
     * "museus"); sem ele, como palavra inteira ou no plural ("bar" casa com "bares", nao com "barato").
     */
    static boolean has(String text, String term) {
        boolean prefix = term.endsWith("*");
        String word = prefix ? term.substring(0, term.length() - 1) : term;
        for (int i = text.indexOf(word); i >= 0; i = text.indexOf(word, i + 1)) {
            if (i > 0 && Character.isLetter(text.charAt(i - 1))) continue;
            if (prefix) return true;
            int end = i + word.length();
            if (wordEnds(text, end)
                    || (text.startsWith("s", end) && wordEnds(text, end + 1))
                    || (text.startsWith("es", end) && wordEnds(text, end + 2))) {
                return true;
            }
        }
        return false;
    }

    private static boolean wordEnds(String text, int index) {
        return index >= text.length() || !Character.isLetter(text.charAt(index));
    }
}
