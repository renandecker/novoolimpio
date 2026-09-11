package br.com.sol7.olimpio.relatorios.filtros.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.quarkus.runtime.annotations.RegisterForReflection;

import java.util.List;

@RegisterForReflection
public record FiltroRelatorioDetailDTO(
    Long id,
    String nome,
    String informacao,
    boolean fixo,
    boolean exibirFiltro,
    String tipo,
    DimensaoDTO dimensao,
    String operacao,
    String dataInicio,
    String dataFim,
    String periodoDinamico,
    String valorFixo,
    List<Long> tabelasIds,
    List<Long> graficosIds,
    List<Long> mapasIds,
    List<Long> organogramasIds
) {
    @RegisterForReflection
    public record DimensaoDTO(
        Long id,
        String nome,
        @JsonProperty("tipoInfo")
        String tipoInfo
    ) {}
}