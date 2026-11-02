package com.trajetto.backend.itinerary.ai;

import com.anthropic.client.AnthropicClient;
import com.anthropic.client.okhttp.AnthropicOkHttpClient;
import com.anthropic.core.JsonValue;
import com.anthropic.errors.AnthropicException;
import com.anthropic.models.messages.MessageCreateParams;
import com.anthropic.models.messages.OutputConfig;
import com.anthropic.models.messages.StopReason;
import com.anthropic.models.messages.StructuredMessage;
import com.anthropic.models.messages.StructuredMessageCreateParams;
import com.anthropic.models.messages.StructuredOutputConfig;
import com.trajetto.backend.itinerary.dto.TravelPace;
import com.trajetto.backend.itinerary.planning.TripPreferences;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Traduz o pedido do viajante em texto livre ("menos igrejas, mais comida de rua, quero ver o
 * Coliseu") em {@link TripPreferences}. A IA so interpreta o pedido; quem escolhe os lugares e
 * monta o roteiro continua sendo o algoritmo do {@code ItineraryPlanner}.
 *
 * <p>Usa o Claude pela API da Anthropic, com saida estruturada (a resposta ja vem no formato
 * do registro, validada contra o esquema). Sem chave configurada, ou se a chamada falhar, cai
 * no {@link RuleBasedInterpreter}: o recurso continua funcionando, so que mais simples.</p>
 */
@Slf4j
@Service
public class PreferenceInterpreter {

    static final String MODEL = "claude-opus-5-5";
    private static final Set<String> PACES = Set.of(TravelPace.INTENSO.name(), TravelPace.EQUILIBRADO.name(), TravelPace.LEVE.name());

    public enum Source { IA, REGRAS }

    public record Interpretation(TripPreferences preferences, Source source) {}

    private final AnthropicClient client;

    public PreferenceInterpreter(@Value("${anthropic.api.key:}") String apiKey) {
        this.client = apiKey == null || apiKey.isBlank() ? null : AnthropicOkHttpClient.builder()
                .apiKey(apiKey)
                .timeout(Duration.ofSeconds(25))
                .maxRetries(1)
                .build();
    }

    public boolean aiEnabled() {
        return client != null;
    }

    /**
     * @param cityName     cidade do roteiro, para a IA reconhecer os lugares citados
     * @param currentStops nomes das paradas atuais, para pedidos como "tira o segundo museu"
     */
    public Interpretation interpret(String request, String cityName, List<String> currentStops) {
        if (request == null || request.isBlank()) return new Interpretation(TripPreferences.NONE, Source.REGRAS);
        if (client != null) {
            Optional<TripPreferences> fromAi = askClaude(request.trim(), cityName, currentStops);
            if (fromAi.isPresent()) return new Interpretation(fromAi.get(), Source.IA);
        }
        return new Interpretation(RuleBasedInterpreter.interpret(request), Source.REGRAS);
    }

    private Optional<TripPreferences> askClaude(String request, String cityName, List<String> currentStops) {
        StructuredMessageCreateParams<TripPreferences> params = MessageCreateParams.builder()
                .model(MODEL)
                .maxTokens(16000L)
                .system(systemPrompt())
                .addUserMessage(userPrompt(request, cityName, currentStops))
                .outputConfig(StructuredOutputConfig.<TripPreferences>builder()
                        .format(TripPreferences.class)
                        .effort(OutputConfig.Effort.LOW)
                        .build())
                .putAdditionalHeader("anthropic-beta", "server-side-fallback-2026-07-01")
                .putAdditionalBodyProperty("fallbacks", JsonValue.from("default"))
                .build();
        try {
            StructuredMessage<TripPreferences> response = client.messages().create(params);
            if (response.stopReason().filter(StopReason.REFUSAL::equals).isPresent()) {
                log.warn("A IA recusou interpretar o pedido; usando as regras.");
                return Optional.empty();
            }
            return response.content().stream()
                    .flatMap(block -> block.text().stream())
                    .map(text -> sanitize(text.text()))
                    .findFirst();
        } catch (AnthropicException | IllegalArgumentException e) {
            log.warn("IA indisponivel para interpretar o pedido ({}); usando as regras.", e.getMessage());
            return Optional.empty();
        }
    }

    /** O esquema garante o formato; aqui garantimos que as categorias e o ritmo existem mesmo. */
    static TripPreferences sanitize(TripPreferences raw) {
        List<String> more = raw.moreCategories().stream().filter(TravelCategories::isKnown).toList();
        List<String> less = raw.lessCategories().stream().filter(TravelCategories::isKnown).toList();
        String pace = PACES.contains(raw.pace()) ? raw.pace() : "";
        TripPreferences clean = new TripPreferences(more, less, raw.avoidPaid(), pace,
                raw.mustInclude(), raw.exclude(), raw.summary());
        return clean.summary().isBlank() ? clean.withSummary(RuleBasedInterpreter.summary(clean)) : clean;
    }

    private static String systemPrompt() {
        String categories = TravelCategories.ALL.stream()
                .map(c -> "- " + c.id() + ": " + c.description())
                .collect(Collectors.joining("\n"));
        return """
                Você é o assistente do Trajetto, um app que gera roteiros turísticos. O viajante escreve \
                como quer a viagem e você converte o pedido em ajustes para o gerador de roteiros. \
                Você não escolhe os lugares: só diz o que priorizar e o que evitar.

                Categorias do catálogo (use exatamente estes ids):
                %s

                Regras:
                - moreCategories / lessCategories: ids da lista acima. "Comida de rua" e "compras" são marketplace; \
                "vida noturna" é bar e pub; "história" cobre os ids historic_*; "natureza" cobre park, garden e nature_reserve.
                - mustInclude: só lugares que o viajante citou pelo nome. Escreva o nome como ele é conhecido \
                localmente ou em português (ex.: "Coliseu", "Torre Eiffel").
                - exclude: lugares citados pelo nome que ele não quer, inclusive paradas atuais do roteiro.
                - pace: INTENSO (dias cheios), EQUILIBRADO ou LEVE (com calma); texto vazio se ele não falou de ritmo.
                - avoidPaid: true se ele quer economizar ou só lugares gratuitos.
                - summary: uma ou duas frases curtas, no idioma do pedido, em tom amigável, dizendo o que vai mudar. \
                Não prometa lugares específicos além dos que ele citou.
                - Se o pedido não tiver nada a ver com o roteiro, devolva tudo vazio e explique no summary.
                """.formatted(categories);
    }

    private static String userPrompt(String request, String cityName, List<String> currentStops) {
        String stops = currentStops == null || currentStops.isEmpty() ? "(roteiro novo)"
                : String.join("; ", currentStops);
        return """
                Cidade: %s
                Paradas atuais: %s

                Pedido do viajante:
                <pedido>%s</pedido>
                """.formatted(cityName == null ? "não informada" : cityName, stops, request);
    }
}
