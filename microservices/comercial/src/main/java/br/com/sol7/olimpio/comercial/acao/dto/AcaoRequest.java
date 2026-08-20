package br.com.sol7.olimpio.comercial.acao;

import java.math.BigDecimal;
import java.util.Date;

public record AcaoRequest(String descricao,Date dataColeta,Long tipoAcaoId,Date dataInicial,Date dataFinalCaptacao,Date dataFinal,Integer meta,BigDecimal custo,Long responsavelId){}
