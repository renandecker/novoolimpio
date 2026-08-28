package br.com.sol7.olimpio.central.ligacao;

import java.util.Date;

public record LigacaoAgendarCompromissoRequest(
    Long ligacaoId,
    Long ordemLigacaoId,
    Long agendaId,
    Date data,
    Long horarioId,
    String descricao,
    Long cursoInteresseId,
    String observacao,
    int tipoHorario
) {}