package br.com.sol7.olimpio.central.ligacao;

import java.util.Date;

public record LigacaoFinalizarRequest(
    Long ligacaoId,
    Long ordemLigacaoId,
    Long resultadoContatoId,
    String relato,
    Long compromissoId,
    Long cursoInteresseId,
    String telefoneDiscado
) {}