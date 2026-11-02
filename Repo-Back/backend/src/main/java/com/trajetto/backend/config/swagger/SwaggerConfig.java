package com.trajetto.backend.config.swagger;

import com.trajetto.backend.exception.ApiError;
import com.trajetto.backend.exception.ApiErrorCode;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.oas.models.examples.Example;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.media.Content;
import io.swagger.v3.oas.models.media.MediaType;
import io.swagger.v3.oas.models.media.Schema;
import io.swagger.v3.oas.models.parameters.Parameter;
import io.swagger.v3.oas.models.responses.ApiResponse;
import io.swagger.v3.oas.models.responses.ApiResponses;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.tags.Tag;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;

import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Página da documentação da API (Swagger UI em {@code /swagger-ui.html}, JSON em {@code /v3/api-docs}).
 * <p>
 * Além das informações gerais, este arquivo define o que vale para todos os endpoints:
 * <ul>
 *   <li>o token JWT é exigido por padrão — os endpoints públicos anulam a exigência com
 *       {@code @SecurityRequirements} no próprio controller;</li>
 *   <li>toda resposta de erro usa o contrato único {@code ApiError}: as que o controller
 *       documentou e as comuns a todos (400 quando há entrada, 401 quando há token, 500),
 *       cada uma com um exemplo do corpo montado para aquele endpoint.</li>
 * </ul>
 */
@Configuration
public class SwaggerConfig {

    public static final String SECURITY_SCHEME = "AuthServer";

    private static final String ERROR_SCHEMA = "#/components/schemas/ApiError";
    private static final String EXAMPLE_TIMESTAMP = "2026-11-02T14:03:22.123-03:00";

    private static final String DESCRIPTION = """
            API do **Trajetto**, aplicativo de descoberta e planejamento de roteiros turísticos \
            personalizados (TCC — Sistemas de Informação).

            ### Autenticação
            1. Crie uma conta em `POST /user/create` e confirme o e-mail em `POST /user/verify`.
            2. Entre em `POST /user/login`: a resposta traz o `token` JWT.
            3. Clique em **Authorize** e cole o token. Ele vai no cabeçalho \
            `Authorization: Bearer <token>` de todas as chamadas marcadas com cadeado.

            Endpoints sem cadeado são públicos. Os do painel gerencial (`/stats`) e os de \
            administração de usuários exigem, além do token, uma permissão do perfil de acesso \
            (`STATS_VIEW`, `USERS_VIEW`, `USERS_MANAGE`, `ROLES_ASSIGN`).

            ### Erros
            Toda falha volta no mesmo formato JSON (`ApiError`), com um `code` estável que o \
            aplicativo usa para decidir o que mostrar. A lista completa de códigos está em \
            `Repo-Back/backend/docs/CONTRATO-DE-ERRO.md`.

            ### Convenções
            - Datas no formato ISO (`2026-11-20`); horários em `HH:mm`.
            - Coordenadas em graus decimais (WGS 84); distâncias em metros e durações em segundos.
            - Os lugares do catálogo são identificados pelo `xid` (ex.: `osm_colosseo`).
            """;

    @Bean
    public OpenAPI customOpenAPI() {
        Contact contact = new Contact()
                .name("Equipe Trajetto")
                .url("https://github.com/TrajettoBSI/Trajetto");

        return new OpenAPI()
                .info(new Info()
                        .title("Trajetto API")
                        .version("v1.0")
                        .contact(contact)
                        .license(new License().name("Uso acadêmico"))
                        .description(DESCRIPTION))
                .servers(List.of(new Server().url("http://localhost:8080").description("Ambiente local")))
                .addSecurityItem(new SecurityRequirement().addList(SECURITY_SCHEME))
                .tags(List.of(
                        tag("Usuários", "Cadastro, login, verificação de e-mail e perfil do usuário"),
                        tag("Senha", "Recuperação de senha por código enviado ao e-mail"),
                        tag("Perfis de acesso", "Perfis (roles) e as permissões de cada um"),
                        tag("Cidades", "Cidades atendidas pelo catálogo de pontos turísticos"),
                        tag("Lugares", "Busca no catálogo de pontos turísticos, destaques e fotos"),
                        tag("Roteiros", "Geração e edição dos roteiros de viagem do usuário"),
                        tag("Favoritos", "Locais favoritos do usuário"),
                        tag("Avaliações", "Notas e comentários dos usuários sobre os pontos turísticos"),
                        tag("Rotas", "Trajetos entre pontos do mapa (a pé, de carro e transporte público)"),
                        tag("Pontos turísticos (Overpass)", "Busca direta no OpenStreetMap, fora do catálogo"),
                        tag("Painel gerencial", "Indicadores agregados do painel administrativo")))
                .components(new Components());
    }

    /**
     * Completa as respostas de cada operação: acrescenta os erros comuns que faltam e faz toda
     * resposta de erro apontar para o {@code ApiError}, com um exemplo do corpo para o endpoint.
     */
    @Bean
    public OpenApiCustomizer standardErrorResponses() {
        return openApi -> {
            // Registrado aqui, e não no bean OpenAPI: nenhum controller devolve ApiError
            // diretamente, então o springdoc o descartaria como schema não usado, e as
            // referências abaixo ficariam quebradas na página.
            if (openApi.getComponents() == null) {
                openApi.setComponents(new Components());
            }
            ModelConverters.getInstance().readAll(ApiError.class).forEach(openApi.getComponents()::addSchemas);

            if (openApi.getPaths() == null) {
                return;
            }
            openApi.getPaths().forEach((path, item) -> item.readOperationsMap().forEach((method, operation) -> {
                ApiResponses responses = operation.getResponses();
                boolean hasBody = operation.getRequestBody() != null;
                boolean hasInput = hasBody
                        || (operation.getParameters() != null && !operation.getParameters().isEmpty());

                if (hasInput) {
                    responses.putIfAbsent("400", new ApiResponse().description("Dados inválidos na requisição"));
                }
                if (requiresToken(operation, openApi)) {
                    responses.putIfAbsent("401", new ApiResponse().description("Token ausente, inválido ou expirado"));
                }
                responses.putIfAbsent("500", new ApiResponse().description("Erro inesperado no servidor"));

                String examplePath = examplePath(path, operation);
                responses.forEach((code, response) -> {
                    int status = Integer.parseInt(code);
                    if (status >= 400) {
                        response.setContent(new Content().addMediaType("application/json", new MediaType()
                                .schema(new Schema<>().$ref(ERROR_SCHEMA))
                                .addExamples("exemplo", errorExample(status, examplePath, method, hasBody))));
                    }
                });

                ApiResponses sorted = new ApiResponses();
                responses.entrySet().stream()
                        .sorted(Comparator.comparing(Map.Entry::getKey))
                        .forEach(e -> sorted.addApiResponse(e.getKey(), e.getValue()));
                operation.setResponses(sorted);
            }));
        };
    }

    private static boolean requiresToken(Operation operation, OpenAPI openApi) {
        List<SecurityRequirement> security = operation.getSecurity() != null
                ? operation.getSecurity()
                : openApi.getSecurity();
        return security != null && !security.isEmpty();
    }

    /** O caminho com os parâmetros de rota trocados pelos exemplos declarados ({@code /itinerary/15/name}). */
    private static String examplePath(String path, Operation operation) {
        String result = path;
        if (operation.getParameters() != null) {
            for (Parameter parameter : operation.getParameters()) {
                if ("path".equals(parameter.getIn()) && parameter.getExample() != null) {
                    result = result.replace("{" + parameter.getName() + "}", parameter.getExample().toString());
                }
            }
        }
        return result;
    }

    private static Example errorExample(int status, String path, PathItem.HttpMethod method, boolean hasBody) {
        HttpStatus httpStatus = HttpStatus.valueOf(status);
        ApiErrorCode code = status == 400 && hasBody ? ApiErrorCode.VALIDATION_ERROR
                : status == 401 ? ApiErrorCode.SESSION_EXPIRED
                : ApiErrorCode.fromStatus(httpStatus);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", EXAMPLE_TIMESTAMP);
        body.put("status", status);
        body.put("error", httpStatus.getReasonPhrase());
        body.put("code", code.name());
        body.put("message", code.getDefaultMessage());
        body.put("path", path);
        body.put("method", method.name());
        body.put("traceId", "3f1c2b9e");
        return new Example().value(body);
    }

    private static Tag tag(String name, String description) {
        return new Tag().name(name).description(description);
    }
}
