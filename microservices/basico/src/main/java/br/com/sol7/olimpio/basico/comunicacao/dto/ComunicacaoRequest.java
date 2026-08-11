package br.com.sol7.olimpio.basico.comunicacao.dto;
import java.util.Date;

public record ComunicacaoRequest(Long usuarioId, String titulo, String mensagem, Date data) {}
