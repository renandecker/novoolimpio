package br.com.sol7.olimpio.financeiro.cheque.dto;

import java.util.Date;

import br.com.sol7.olimpio.financeiro.cheque.entity.Cheque;

public record ChequeResponse(Long id,Long movimentacaoId,Date data,String numero){}
