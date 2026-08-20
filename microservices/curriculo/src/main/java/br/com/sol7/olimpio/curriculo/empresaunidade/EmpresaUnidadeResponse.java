package br.com.sol7.olimpio.curriculo.empresaunidade;

import java.sql.Time;

public record EmpresaUnidadeResponse(
        Long id,
        Long id_empresa,
        Long id_unidade,
        Time inicio,
        Time fim,
        Boolean pre_autorizado,
        Long id_tipo_contrato){
        }
