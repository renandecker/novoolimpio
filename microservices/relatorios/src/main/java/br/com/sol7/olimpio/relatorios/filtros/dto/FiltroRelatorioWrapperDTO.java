package br.com.sol7.olimpio.relatorios.filtros.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.runtime.annotations.RegisterForReflection;

@RegisterForReflection
public record FiltroRelatorioWrapperDTO(
    FiltroRelatorioDTO filtroRelatorio,
    boolean selected,
    String informacao
) {
    @RegisterForReflection
    public record DimensaoDTO(
        @JsonProperty("tipoInfo")
        String tipoInfo
    ) {}

    @RegisterForReflection
    public record FiltroRelatorioDTO(
        Long id,
        String nome,
        boolean fixo,
        boolean exibirFiltro,
        String tipo,
        String informacao,
        @JsonProperty("dimensao")
        DimensaoDTO dimensao
    ) {}
}