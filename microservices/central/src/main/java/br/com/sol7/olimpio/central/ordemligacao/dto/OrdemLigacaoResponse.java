package br.com.sol7.olimpio.central.ordemligacao;

import java.util.Date;

public record OrdemLigacaoResponse(Long id, Long prospectoId, Long operacionalId, Date dataCriacao, String status, boolean prioritaria, int tentativas, Date ultimaTentativa) {}