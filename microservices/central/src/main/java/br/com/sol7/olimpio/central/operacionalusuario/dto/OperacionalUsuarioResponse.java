package br.com.sol7.olimpio.central.operacionalusuario;

public record OperacionalUsuarioResponse(
        Long id,
        Long operacionalId,
        Long usuarioId,
        String status,
        Integer meta,
        Integer ligacao,
        Integer agendado,
        Integer pausa,
        Integer prioritario
) {}