package br.com.sol7.olimpio.notificacoes.notificacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record NotificacaoRegraRequest(
            @NotBlank(message = "O nome da regra é obrigatório")
            String nome,

            String descricao,

            @NotBlank(message = "O tipo de regra é obrigatório")
            String tipoRegra,

            @NotBlank(message = "O canal de notificação é obrigatório")
            String canal,

            @NotBlank(message = "O destinatário da regra é obrigatório")
            String destinatario,

            @NotNull(message = "O valor limite é obrigatório")
            Double valorLimite,

            Boolean destinatarioProfessor,

            Boolean ativo) {}