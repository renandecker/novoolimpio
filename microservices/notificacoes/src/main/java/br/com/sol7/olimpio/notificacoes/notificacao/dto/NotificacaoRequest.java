package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record NotificacaoRequest(
        String username,
@NotBlank @Size(max = 255) String titulo,
        String mensagem,
        String tipo,
        String link,
        Boolean canalMobile,
        Boolean canalEmail){}
