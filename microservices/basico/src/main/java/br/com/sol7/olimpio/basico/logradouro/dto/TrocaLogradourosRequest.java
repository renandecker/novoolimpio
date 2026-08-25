package br.com.sol7.olimpio.basico.logradouro.dto;

import java.util.List;

public record TrocaLogradourosRequest(Long destinoId, List<Long> origemIds) {
}
