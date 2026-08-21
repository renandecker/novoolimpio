package br.com.sol7.olimpio.curriculo.empresa;

import java.util.Date;

public record EmpresaResponse(
        Long id,
        Long id_pessoa,
        String pessoa_nome,
        String pessoa_nomeFantasia,
        String pessoa_razaoSocial,
        String pessoa_cnpj,
        String pessoa_telefone,
        String pessoa_email,
        Date dt_inicio,
        Date dt_fim,
        Boolean fl_ativo){
        }
