package br.com.sol7.olimpio.educacao.desistente;
import java.util.Date;

public record DesistenteRequest(String descricao, Date dataCriacao, Long pessoaFuncionarioId, Long contratoId, Long motivoId, boolean ativo) {}
