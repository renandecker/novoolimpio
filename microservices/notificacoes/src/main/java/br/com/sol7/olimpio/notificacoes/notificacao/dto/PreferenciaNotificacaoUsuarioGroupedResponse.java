package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import java.util.List;

public record PreferenciaNotificacaoUsuarioGroupedResponse(
        List<PreferenciaNotificacaoCategoriaResponse> categorias
) {}