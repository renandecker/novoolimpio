package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ConfigCanalRequest(
        @NotBlank @Size(max = 30) String canal,
        Boolean ativo,
        @Size(max = 255) String destinatario,
        @Size(max = 255) String descricao) {}
