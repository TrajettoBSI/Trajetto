package com.trajetto.backend.exception;

import io.swagger.v3.oas.annotations.media.Schema;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

/**
 * Contrato único de erro da API.
 * <p>
 * Toda falha tratada pela aplicação — de negócio, de validação, de segurança ou inesperada —
 * é convertida para este formato pelo {@link GlobalExceptionHandler}, de modo que o frontend
 * sempre receba a mesma estrutura JSON:
 *
 * <pre>
 * {
 *   "timestamp": "2026-08-16T14:03:22.123-03:00",  // momento da ocorrência
 *   "status": 404,                                  // status HTTP
 *   "error": "Not Found",                           // descrição do status HTTP
 *   "code": "RESOURCE_NOT_FOUND",                   // identificação do erro
 *   "message": "Usuário não encontrado.",           // mensagem legível
 *   "path": "/user/42",                             // origem da falha
 *   "method": "GET",
 *   "traceId": "3f1c2b9e",                          // correlação com o log do servidor
 *   "details": [                                    // presente apenas em erros de validação
 *     { "field": "email", "message": "deve ser um e-mail válido", "rejectedValue": "abc" }
 *   ]
 * }
 * </pre>
 */
@Schema(name = "ApiError", description = "Contrato único de erro: todas as falhas da API voltam neste formato.")
public record ApiError(

        @Schema(description = "Momento da ocorrência", example = "2026-11-02T14:03:22.123-03:00", type = "string", format = "date-time")
        @JsonFormat(shape = JsonFormat.Shape.STRING)
        OffsetDateTime timestamp,

        @Schema(description = "Status HTTP", example = "404")
        int status,

        @Schema(description = "Descrição do status HTTP", example = "Not Found")
        String error,

        @Schema(description = "Código estável do erro, usado pelo aplicativo", example = "RESOURCE_NOT_FOUND")
        String code,

        @Schema(description = "Mensagem legível para o usuário", example = "Roteiro não encontrado.")
        String message,

        @Schema(description = "Caminho chamado", example = "/itinerary/99/name")
        String path,

        @Schema(description = "Método HTTP chamado", example = "PATCH")
        String method,

        @Schema(description = "Identificador para localizar a falha no log do servidor", example = "3f1c2b9e")
        String traceId,

        @Schema(description = "Campos rejeitados; presente apenas em erros de validação")
        @JsonInclude(JsonInclude.Include.NON_EMPTY)
        List<FieldError> details
) {

    /** Detalhe de um campo específico rejeitado na validação. */
    @JsonInclude(JsonInclude.Include.NON_NULL)
    @Schema(description = "Campo rejeitado na validação")
    public record FieldError(
            @Schema(description = "Nome do campo", example = "email") String field,
            @Schema(description = "Motivo da rejeição", example = "Informe um e-mail válido") String message,
            @Schema(description = "Valor enviado", example = "ana.silva@") Object rejectedValue) {
    }

    public static ApiError of(ApiErrorCode code, String message, String path, String method) {
        return of(code, message, path, method, List.of());
    }

    public static ApiError of(ApiErrorCode code,
                              String message,
                              String path,
                              String method,
                              List<FieldError> details) {
        return new ApiError(
                OffsetDateTime.now(),
                code.getStatus().value(),
                code.getStatus().getReasonPhrase(),
                code.name(),
                message != null && !message.isBlank() ? message : code.getDefaultMessage(),
                path,
                method,
                newTraceId(),
                details
        );
    }

    private static String newTraceId() {
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
