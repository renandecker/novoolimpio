package br.com.sol7.olimpio.financeiro.cobranca;

import java.util.Date;

public record CobrancaRequest(Long contratoId,Long etapasCobrancaId,Date devendoDesde,Date dataUltimaCarta,Date dataUltimoRetorno,Date dataUltimaSms,Date dataUltimaLigacao,Date dataUltimoEmail,Long ligacaoCobrancaId,Integer qtdLigacoes,Integer qtdEmails,Integer qtdCartas,Integer qtdSms){}
