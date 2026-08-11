package br.com.sol7.olimpio.professor.nota.dto;
import java.math.BigDecimal;

public record GrauNotaRequest(Long grauId, Integer numeroNota, BigDecimal peso, String nome, String descricao, Integer qtdeNota, Integer qtdeNotaAluno) {}
