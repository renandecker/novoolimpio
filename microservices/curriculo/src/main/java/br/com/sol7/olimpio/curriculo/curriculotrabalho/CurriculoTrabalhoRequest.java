package br.com.sol7.olimpio.curriculo.curriculotrabalho;

import java.util.Date;
import java.util.List;

public record CurriculoTrabalhoRequest(
        Long id_pessoa,
        Date dt_inicio,
        Date dt_fim,
        Boolean fl_ativo,
        List<CampoInformacaoRequest> campo_informacoes) {

    public record CampoInformacaoRequest(Long id, Long id_campo, String valor) {
    }
}
