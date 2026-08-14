package br.com.sol7.olimpio.educacao.auditoria.dto;

import java.util.Date;
import java.util.List;

public record AuditoriaResponse(
        String entidade,
        Long id,
        Integer rev,
        Integer revType,
        Date data,
        String usuario,
        String acao,
        List<AuditoriaCampo> campos) {}
