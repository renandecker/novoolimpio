package br.com.sol7.olimpio.curriculo.curriculotrabalho;

import java.util.Date;
import java.util.List;

public record CurriculoTrabalhoResponse(
        Long id,
        Long id_pessoa,
        Date dt_inicio,
        Date dt_fim,
        Boolean fl_ativo,
        List<CampoInformacaoResponse> campo_informacoes){

public record CampoInformacaoResponse(Long id,Long id_campo,String valor){
        }
        }
