package br.com.sol7.olimpio.relatorios.organograma;
import java.util.Date;

public record OrganogramaResponse(Long id, String nome, Date dataCadastro, Date dataAlteracao) {}
