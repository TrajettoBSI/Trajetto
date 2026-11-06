package com.trajetto.backend.itinerary.ai;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * As categorias do catalogo de pontos turisticos e como o viajante costuma chama-las. O
 * interpretador por regras procura essas palavras no pedido.
 */
final class TravelCategories {

    private TravelCategories() {}

    /**
     * @param words sem acento e em minusculas, em portugues, ingles e espanhol; ver
     *              {@link RuleBasedInterpreter#has}: "museu*" casa com o comeco da palavra,
     *              "bar" so com a palavra inteira (ou no plural)
     */
    record Category(String id, String pt, String en, String es, List<String> words) {

        String description(String language) {
            return switch (language) {
                case "en" -> en;
                case "es" -> es;
                default -> pt;
            };
        }
    }

    private static final String[] NATURE = {"natureza", "nature", "naturaleza"};
    private static final String[] NIGHTLIFE = {"balada*", "nightlife", "vida noturna", "vida nocturna", "noitada", "cerveja*", "beer*", "cerveza*"};
    private static final String[] HISTORY = {"historia*", "history", "historic*", "antig*", "ancient"};
    private static final String[] KIDS = {"crianca*", "kid*", "children", "ninos", "familia*", "family"};
    private static final String[] INDOOR = {"coberto*", "cubierto*", "indoor*", "lugares fechados", "chuva", "chover", "rain*", "lluvia*"};

    private static List<String> words(String[] shared, String... own) {
        List<String> all = new ArrayList<>(List.of(own));
        all.addAll(List.of(shared));
        return List.copyOf(all);
    }

    static final List<Category> ALL = List.of(
            new Category("museum", "museus", "museums", "museos",
                    words(INDOOR, "museu*", "museum*", "museo*", "exposic*", "exhibit*", "cultura*", "culture")),
            new Category("gallery", "galerias de arte", "art galleries", "galerías de arte",
                    words(INDOOR, "galeria*", "gallery", "galleries", "arte", "art", "pintura*", "cultura*", "culture")),
            new Category("historic_church", "igrejas, catedrais e basílicas", "churches, cathedrals and basilicas", "iglesias, catedrales y basílicas",
                    List.of("igreja*", "catedra*", "basilica*", "church*", "cathedral*", "iglesia*", "religi*", "capela*", "capilla*")),
            new Category("historic_monastery", "mosteiros e conventos", "monasteries and convents", "monasterios y conventos",
                    List.of("mosteiro*", "convento*", "monaster*")),
            new Category("historic_temple", "templos", "temples", "templos",
                    List.of("templo*", "temple*", "santuario*", "shrine*")),
            new Category("park", "parques", "parks", "parques",
                    words(NATURE, "parque*", "park", "verde", "ar livre", "aire libre", "outdoor*")),
            new Category("garden", "jardins", "gardens", "jardines",
                    words(NATURE, "jardi*", "garden*", "flores")),
            new Category("nature_reserve", "reservas naturais", "nature reserves", "reservas naturales",
                    words(NATURE, "trilha*", "sendero*", "reserva natural", "reservas naturais", "reservas naturales", "hiking", "hike*")),
            new Category("viewpoint", "mirantes", "viewpoints", "miradores",
                    List.of("mirante*", "vista", "panoram*", "viewpoint*", "mirador*", "por do sol", "sunset*", "atardecer", "foto*", "instagram*")),
            new Category("peak", "morros e picos", "hills and peaks", "cerros y picos",
                    List.of("morro*", "pico", "peak", "cerro*", "montanha*", "mountain*", "montana*", "trilha*", "sendero*", "hiking", "hike*")),
            new Category("beach", "praias", "beaches", "playas",
                    List.of("praia*", "beach*", "playa*", "mar")),
            new Category("marketplace", "mercados e feiras", "markets and fairs", "mercados y ferias",
                    List.of("mercado*", "feira", "feria", "market*", "compras", "shopping", "comida de rua", "street food", "comida callejera")),
            new Category("bar", "bares", "bars", "bares",
                    words(NIGHTLIFE, "bar", "barzinho*", "drink*")),
            new Category("pub", "pubs", "pubs", "pubs",
                    words(NIGHTLIFE, "pub")),
            new Category("historic_archaeological_site", "sítios arqueológicos", "archaeological sites", "sitios arqueológicos",
                    words(HISTORY, "arqueolog*", "archaeolog*", "ruina*", "ruins")),
            new Category("historic_ruins", "ruínas", "ruins", "ruinas",
                    words(HISTORY, "ruina*", "ruins")),
            new Category("historic_castle", "castelos e palácios", "castles and palaces", "castillos y palacios",
                    List.of("castelo*", "castle*", "castillo*", "palacio*", "palace*", "historia*", "history")),
            new Category("historic_monument", "monumentos históricos", "historic monuments", "monumentos históricos",
                    List.of("monumento*", "monument*", "historia*", "history", "historic*")),
            new Category("historic_fort", "fortes e fortalezas", "forts and fortresses", "fuertes y fortalezas",
                    List.of("forte", "fortaleza*", "fort", "fortress*", "fuerte")),
            new Category("artwork", "estátuas, esculturas e arte de rua", "statues, sculptures and street art", "estatuas, esculturas y arte callejero",
                    List.of("estatua*", "escultura*", "sculpture*", "street art", "arte de rua", "arte callejero", "arte urbano", "grafite*", "graffiti", "statue*")),
            new Category("attraction", "atrações turísticas em geral", "general tourist attractions", "atracciones turísticas en general",
                    List.of("atrac*", "attraction*", "turistic*")),
            new Category("theme_park", "parques de diversão", "theme parks", "parques de atracciones",
                    words(KIDS, "diversao", "diversoes", "diversiones", "theme park*", "parque de atracciones")),
            new Category("zoo", "zoológicos e aquários", "zoos and aquariums", "zoológicos y acuarios",
                    words(KIDS, "zoo", "zoologico*", "aquario*", "aquarium*", "acuario*", "animais", "animal", "animales"))
    );

    static final Map<String, Category> BY_ID = new LinkedHashMap<>();

    static {
        ALL.forEach(c -> BY_ID.put(c.id(), c));
    }

    static boolean isKnown(String id) {
        return BY_ID.containsKey(id);
    }
}
