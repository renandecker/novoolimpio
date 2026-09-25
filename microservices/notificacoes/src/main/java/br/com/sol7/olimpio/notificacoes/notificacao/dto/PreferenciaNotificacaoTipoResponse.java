package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import java.util.List;

public record PreferenciaNotificacaoTipoResponse(
        String tipo,
        String tipoLabel,
        String descricao,
        List<PreferenciaNotificacaoCanalResponse> canais
) {}