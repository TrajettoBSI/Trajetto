package com.trajetto.backend.itinerary.ai;

import com.trajetto.backend.itinerary.data.CityCatalog.CatalogPlace;
import com.trajetto.backend.itinerary.planning.TripPreferences;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Traduz o pedido do viajante em texto livre ("menos igrejas, mais comida de rua, quero ver o
 * Coliseu") em {@link TripPreferences}. Interpreta por palavras-chave, sem servico externo
 * ({@link RuleBasedInterpreter}); quem escolhe os lugares e monta o roteiro continua sendo o
 * algoritmo do {@code ItineraryPlanner}.
 */
@Service
public class PreferenceInterpreter {

    public TripPreferences interpret(String request, List<CatalogPlace> places) {
        return interpret(request, places, null);
    }

    /**
     * @param places   lugares do catalogo da cidade, para achar os citados pelo nome
     * @param language idioma do app ("en-US"), o da resposta; sem ele, portugues
     */
    public TripPreferences interpret(String request, List<CatalogPlace> places, String language) {
        if (request == null || request.isBlank()) return TripPreferences.NONE;
        return RuleBasedInterpreter.interpret(request, places, AssistantMessages.language(language));
    }
}
