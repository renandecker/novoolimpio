package br.com.sol7.olimpio.relatorios.mapa;

import java.math.BigDecimal;

public record MapaRegraResponse(Long id, String descricao, String cor, BigDecimal meta, BigDecimal meta2, Integer markerTamanho, String condicao, Boolean ativo, Long medidaId, Long medidaMetaId, Long medidaMetaDoisId, Long coresId, Long mapaId) {}