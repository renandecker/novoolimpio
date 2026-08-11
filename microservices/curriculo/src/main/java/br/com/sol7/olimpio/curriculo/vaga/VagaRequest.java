package br.com.sol7.olimpio.curriculo.vaga;

import java.util.Date;
import java.util.List;

public record VagaRequest(
        String nome,
        String descricao,
        String titulo_email,
        String assunto_email,
        Date data_inicio,
        Date data_fim,
        Integer vagas,
        Long id_usuario,
        Boolean fl_ativo,
        Boolean fl_exibir_vaga,
        Boolean fl_email,
        Date data_envio,
        List<Long> perfis,
        List<Long> unidades,
        List<Long> componentes,
        List<Long> oferecimentos,
        List<Long> grupos,
        List<Long> curriculos,
        List<Long> empresas,
        List<Long> usuarios) {
}
