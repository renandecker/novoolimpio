package br.com.sol7.olimpio.financeiro.deposito.dto;

import java.util.Date;

import br.com.sol7.olimpio.financeiro.deposito.entity.Deposito;

public record DepositoRequest(Long movimentacaoId,Date data,String agenciaDestino,String contaDestino){}
