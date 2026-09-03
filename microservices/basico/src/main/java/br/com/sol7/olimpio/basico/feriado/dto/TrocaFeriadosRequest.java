package br.com.sol7.olimpio.basico.feriado.dto;

import java.util.List;

public record TrocaFeriadosRequest(Long destinoId, List<Long> origemIds) {
}
