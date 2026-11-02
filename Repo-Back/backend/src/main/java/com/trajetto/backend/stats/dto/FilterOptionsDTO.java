package com.trajetto.backend.stats.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

/**
 * As opções que o painel oferece em cada seletor do filtro.
 *
 * <p>Vêm do próprio banco, e não de uma lista fixa no aplicativo: assim o
 * seletor nunca oferece um perfil, país ou categoria que não existe na base —
 * escolha que só devolveria painel vazio — e passa a oferecer sozinho os que
 * aparecerem depois.</p>
 *
 * <p>As listas são sempre as da base inteira, sem o recorte aplicado. Se
 * fossem recortadas, escolher um país esconderia todos os outros e o usuário
 * ficaria preso ao filtro que acabou de escolher.</p>
 */
@Schema(description = "Opções de cada seletor do filtro do painel, lidas da base")
public record FilterOptionsDTO(
        @Schema(example = "[\"Aventureiro\", \"Cultural\", \"Sem perfil\"]") List<String> profiles,
        @Schema(example = "[\"Argentina\", \"Brasil\", \"Portugal\"]") List<String> countries,
        @Schema(example = "[\"attraction\", \"museum\", \"park\", \"Outros\"]") List<String> categories
) {}
