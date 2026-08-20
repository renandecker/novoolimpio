package br.com.sol7.olimpio.curriculo.entrevista;

import java.util.Date;
import java.util.List;

public record EntrevistaResponse(
        Long id,
        Long id_usuario,
        Long id_vaga,
        Long id_empresa,
        String token,
        Boolean fl_email_enviado_aluno,
        Boolean fl_email_enviado_empresa,
        Boolean fl_resposta,
        Date data_final,
        Date data_aceite_aluno,
        List<Long> agendas){
        }
