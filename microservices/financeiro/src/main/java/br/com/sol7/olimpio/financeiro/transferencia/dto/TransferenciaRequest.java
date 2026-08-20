package br.com.sol7.olimpio.financeiro.transferencia.dto;

import java.util.Date;

import br.com.sol7.olimpio.financeiro.transferencia.entity.Transferencia;

public record TransferenciaRequest(Long movimentacaoId,Date data,String agenciaOrigem,String contaOrigem,String agenciaDestino,String contaDestino){}
