package br.com.sol7.olimpio.central.ligacao;

import java.util.Date;

public record LigacaoRequest(Long usuarioId, Date dataInicial, Date dataFinal, String relato, Long ordemLigacaoId, Long resultadoContatoId, Long compromissoId, String telefoneDiscado, Long cursoInteresseId) {}
