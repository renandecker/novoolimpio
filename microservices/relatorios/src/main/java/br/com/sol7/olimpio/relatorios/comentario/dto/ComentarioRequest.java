package br.com.sol7.olimpio.relatorios.comentario;

import java.util.Date;

public record ComentarioRequest(String assunto,Long comentarioId,Long usuarioId,Date dataAtualizacao){}
