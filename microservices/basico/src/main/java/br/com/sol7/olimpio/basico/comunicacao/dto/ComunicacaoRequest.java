package br.com.sol7.olimpio.basico.comunicacao.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

public record ComunicacaoRequest(
        Integer idUsuario,
        @NotBlank @Size(max = 255) String titulo,
        String mensagem,
        String tipo,
        String categoria,
        String link,
        Boolean canalSistema,
        Boolean canalMobile,
        Boolean canalEmail,
        Boolean canalTelegram,
        Boolean canalSms,
        Boolean canalWhatsapp,
        Boolean canalNotificacao,
        List<Integer> unidadesIds,
        List<Integer> cursosIds,
        List<Integer> turmasIds,
        List<Integer> pessoasIds,
        List<Integer> usuariosIds
) {}