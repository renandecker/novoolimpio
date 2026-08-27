package br.com.sol7.olimpio.central.turnousuario;

import jakarta.validation.constraints.NotNull;
import java.util.List;

public record TurnoUsuarioLoteRequest(
        @NotNull Long usuarioId,
        @NotNull List<Long> turnoTrabalhoIds) {}
