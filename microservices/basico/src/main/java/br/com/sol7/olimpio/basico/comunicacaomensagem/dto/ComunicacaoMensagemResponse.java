package br.com.sol7.olimpio.basico.comunicacaomensagem.dto;

import java.util.Date;

public record ComunicacaoMensagemResponse(Long id,Date data,Long comunicacaoId,String mensagem){}
