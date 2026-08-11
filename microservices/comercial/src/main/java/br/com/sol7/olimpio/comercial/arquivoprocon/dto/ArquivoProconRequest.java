package br.com.sol7.olimpio.comercial.arquivoprocon;

import java.util.Date;

public record ArquivoProconRequest(Date data, Integer numeroLinhas, Long usuarioId, String hash, Integer prospectosDeletadosPacote) {}
