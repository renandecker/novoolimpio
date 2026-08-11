package br.com.sol7.olimpio.educacao.turnoeducacao;
import java.time.LocalTime;

public record TurnoEducacaoResponse(Long id, String descricao, String sucinto, LocalTime inicio, LocalTime fim) {}
