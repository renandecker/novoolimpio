package br.com.sol7.olimpio.relatorios.estrutura.dto;

import java.util.Date;

public record EstruturaRequest(String tabela,String condicao,String nome,String zoom,Long configuracaoEmailId,Date dataAtualizacao,String coordenada,String nomeBanco){}
