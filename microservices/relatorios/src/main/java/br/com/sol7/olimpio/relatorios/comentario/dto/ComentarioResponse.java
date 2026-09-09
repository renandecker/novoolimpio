package br.com.sol7.olimpio.relatorios.comentario.dto;

import java.util.Date;

public record ComentarioResponse(Long id,String assunto,Long comentarioId,Long usuarioId,Date dataAtualizacao){}
