package br.com.sol7.olimpio.comercial.arquivoprocon;

import java.util.Date;

public record ArquivoProconResponse(Long id,Date data,Integer numeroLinhas,Long usuarioId,String hash,Integer prospectosDeletadosPacote){}
