package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import java.util.List;

public record PreferenciaNotificacaoCategoriaResponse(
        String categoria,
        String categoriaLabel,
        String descricao,
        List<PreferenciaNotificacaoTipoResponse> tipos
) {}