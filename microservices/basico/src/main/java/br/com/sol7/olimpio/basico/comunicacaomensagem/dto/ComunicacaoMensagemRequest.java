package br.com.sol7.olimpio.basico.comunicacaomensagem.dto;

import java.util.Date;

public record ComunicacaoMensagemRequest(Date data,Long comunicacaoId,String mensagem){}
