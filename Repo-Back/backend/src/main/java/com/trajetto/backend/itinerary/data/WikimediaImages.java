package com.trajetto.backend.itinerary.data;

import com.fasterxml.jackson.databind.JsonNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Duration;
import java.util.HexFormat;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Foto de um ponto turistico no Wikimedia Commons, a partir do id dele no Wikidata.
 *
 * <p>O Wikidata guarda a foto principal na propriedade P18; a URL da miniatura no
 * Commons e montada a partir do nome do arquivo, sem uma segunda consulta. A resposta
 * (inclusive "sem foto") fica em memoria: a foto de um ponto praticamente nao muda.</p>
 */
@Component
public class WikimediaImages {

    private static final Logger logger = LoggerFactory.getLogger(WikimediaImages.class);

    private static final String CLAIMS_URL =
            "https://www.wikidata.org/w/api.php?action=wbgetclaims&entity={id}&property=P18&format=json";
    private static final String THUMB_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/%s/%s/%s/%dpx-%s";
    /** O Commons so gera miniaturas em larguras padronizadas (500, 960, 1280...). */
    private static final int THUMB_WIDTH = 960;

    private final RestTemplate restTemplate;
    private final Map<String, Optional<String>> cache = new ConcurrentHashMap<>();

    public WikimediaImages(RestTemplateBuilder restTemplateBuilder) {
        // O Wikimedia recusa pedidos sem um User-Agent que identifique o cliente.
        this.restTemplate = restTemplateBuilder
                .connectTimeout(Duration.ofSeconds(3))
                .readTimeout(Duration.ofSeconds(4))
                .defaultHeader("User-Agent", "Trajetto/1.0 (aplicativo de roteiros turisticos, TCC)")
                .build();
    }

    public Optional<String> imageUrl(String wikidataId) {
        if (wikidataId == null || !wikidataId.matches("Q\\d+")) return Optional.empty();
        Optional<String> cached = cache.get(wikidataId);
        if (cached != null) return cached;
        try {
            Optional<String> url = fileName(restTemplate.getForObject(CLAIMS_URL, JsonNode.class, wikidataId))
                    .map(WikimediaImages::thumbUrl);
            cache.put(wikidataId, url);
            return url;
        } catch (RestClientException e) {
            // Falha de rede nao vai para o cache: a proxima consulta tenta de novo.
            logger.warn("Nao foi possivel buscar a foto de {} no Wikidata: {}", wikidataId, e.getMessage());
            return Optional.empty();
        }
    }

    /** Nome do arquivo da foto preferida (rank "preferred") ou, sem ela, da primeira. */
    static Optional<String> fileName(JsonNode response) {
        JsonNode claims = response == null ? null : response.path("claims").path("P18");
        if (claims == null || !claims.isArray() || claims.isEmpty()) return Optional.empty();
        JsonNode chosen = claims.get(0);
        for (JsonNode claim : claims) {
            if ("preferred".equals(claim.path("rank").asText())) {
                chosen = claim;
                break;
            }
        }
        String name = chosen.path("mainsnak").path("datavalue").path("value").asText("");
        return name.isBlank() ? Optional.empty() : Optional.of(name);
    }

    /** Miniatura do Commons: o caminho usa o MD5 do nome do arquivo, com "_" no lugar dos espacos. */
    static String thumbUrl(String fileName) {
        String name = fileName.replace(' ', '_');
        String md5 = md5(name);
        String encoded = URLEncoder.encode(name, StandardCharsets.UTF_8).replace("+", "%20");
        // SVG e TIFF nao viram miniatura no proprio formato: o Commons entrega em PNG/JPG.
        String lower = name.toLowerCase();
        String thumb = lower.endsWith(".svg") ? encoded + ".png"
                : lower.endsWith(".tif") || lower.endsWith(".tiff") ? "lossy-page1-" + encoded + ".jpg"
                : encoded;
        return String.format(THUMB_URL, md5.substring(0, 1), md5.substring(0, 2), encoded, THUMB_WIDTH, thumb);
    }

    private static String md5(String value) {
        try {
            return HexFormat.of().formatHex(MessageDigest.getInstance("MD5").digest(value.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException e) {
            throw new IllegalStateException(e);
        }
    }
}
