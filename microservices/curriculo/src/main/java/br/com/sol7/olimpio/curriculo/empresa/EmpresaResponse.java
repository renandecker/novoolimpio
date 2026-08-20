package br.com.sol7.olimpio.curriculo.empresa;

import java.util.Date;

public record EmpresaResponse(
        Long id,
        Long id_pessoa,
        Date dt_inicio,
        Date dt_fim,
        Boolean fl_ativo){
        }
