package com.trajetto.backend.itinerary.ai;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * As categorias do catalogo de pontos turisticos e como o viajante costuma chama-las. O
 * interpretador por regras procura essas palavras no pedido.
 */
final class TravelCategories {

    private TravelCategories() {}

    record Category(String id, String description, List<String> words) {}

    /** Palavras sem acento e em minusculas, em portugues, ingles e espanhol. */
    static final List<Category> ALL = List.of(
            new Category("museum", "museus", List.of("museu", "museum", "museo", "exposic", "exhibit")),
            new Category("gallery", "galerias de arte", List.of("galeria", "gallery", "arte", "art ", "pintura")),
            new Category("historic_church", "igrejas, catedrais e basílicas",
                    List.of("igreja", "catedra", "basilica", "church", "iglesia", "religi", "capela")),
            new Category("historic_monastery", "mosteiros e conventos", List.of("mosteiro", "convento", "monaster")),
            new Category("historic_temple", "templos", List.of("templo", "temple", "santuario", "shrine")),
            new Category("park", "parques", List.of("parque", "park", "verde", "natureza", "nature", "ar livre", "outdoor")),
            new Category("garden", "jardins", List.of("jardi", "garden", "flores", "natureza", "nature")),
            new Category("nature_reserve", "reservas naturais", List.of("trilha", "reserva", "natureza", "nature", "hiking")),
            new Category("viewpoint", "mirantes", List.of("mirante", "vista", "panoram", "viewpoint", "mirador", "por do sol", "sunset")),
            new Category("peak", "morros e picos", List.of("morro", "pico", "montanha", "mountain", "trilha", "hiking")),
            new Category("beach", "praias", List.of("praia", "beach", "playa", "mar ")),
            new Category("marketplace", "mercados e feiras",
                    List.of("mercado", "feira", "market", "compras", "shopping", "comida de rua", "street food")),
            new Category("bar", "bares", List.of("bar ", "bares", "balada", "nightlife", "vida noturna", "drink", "cerveja", "beer")),
            new Category("pub", "pubs", List.of("pub", "balada", "vida noturna", "nightlife", "cerveja", "beer")),
            new Category("historic_archaeological_site", "sítios arqueológicos",
                    List.of("arqueolog", "ruina", "ruins", "antig", "ancient", "historia", "history", "historic")),
            new Category("historic_ruins", "ruínas", List.of("ruina", "ruins", "antig", "ancient", "historia", "history")),
            new Category("historic_castle", "castelos e palácios", List.of("castelo", "castle", "castillo", "palacio", "palace", "historia", "history")),
            new Category("historic_monument", "monumentos históricos", List.of("monumento", "monument", "historia", "history", "historic")),
            new Category("historic_fort", "fortes e fortalezas", List.of("forte", "fortaleza", "fort")),
            new Category("artwork", "estátuas, esculturas e arte de rua",
                    List.of("estatua", "escultura", "street art", "arte de rua", "grafite", "statue")),
            new Category("attraction", "atrações turísticas em geral", List.of("atrac", "atraccion", "attraction", "turistic")),
            new Category("theme_park", "parques de diversão", List.of("diversao", "theme park", "crianca", "kids", "familia", "family")),
            new Category("zoo", "zoológicos e aquários", List.of("zoo", "aquario", "aquarium", "animais", "animals", "crianca", "kids"))
    );

    static final Map<String, Category> BY_ID = new LinkedHashMap<>();

    static {
        ALL.forEach(c -> BY_ID.put(c.id(), c));
    }

    static boolean isKnown(String id) {
        return BY_ID.containsKey(id);
    }
}
