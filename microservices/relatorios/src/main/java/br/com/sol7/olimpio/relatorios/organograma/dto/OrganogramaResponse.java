package br.com.sol7.olimpio.relatorios.organograma.dto;

import java.util.Date;

public record OrganogramaResponse(Long id, String nome, String direcao, String sql, Date dataCadastro, Date dataAlteracao) {
}
