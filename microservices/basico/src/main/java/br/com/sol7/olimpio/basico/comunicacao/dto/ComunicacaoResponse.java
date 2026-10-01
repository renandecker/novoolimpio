package br.com.sol7.olimpio.basico.comunicacao.dto;

import br.com.sol7.olimpio.basico.comunicacao.entity.Comunicacao;

import java.time.OffsetDateTime;
import java.util.List;

public record ComunicacaoResponse(
        Long id,
        Integer idUsuario,
        String titulo,
        String mensagem,
        String tipo,
        String categoria,
        String link,
        OffsetDateTime dataEnvio,
        Comunicacao.StatusComunicacao status,
        boolean canalSistema,
        boolean canalMobile,
        boolean canalEmail,
        boolean canalTelegram,
        boolean canalSms,
        boolean canalWhatsapp,
        boolean canalNotificacao,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        List<Integer> unidadesIds,
        List<Integer> cursosIds,
        List<Integer> turmasIds,
        List<Integer> pessoasIds,
        List<Integer> usuariosIds
) {}