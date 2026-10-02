package br.com.sol7.olimpio.basico.modulo.dto;

import java.util.List;

public record ModuloPerfisResponse(List<Long> perfis, List<Long> perfisMarcados) {
}