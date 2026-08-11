package br.com.sol7.olimpio.educacao.turnoeducacao;
import java.time.LocalTime;

public record TurnoEducacaoRequest(String descricao, String sucinto, LocalTime inicio, LocalTime fim) {}
