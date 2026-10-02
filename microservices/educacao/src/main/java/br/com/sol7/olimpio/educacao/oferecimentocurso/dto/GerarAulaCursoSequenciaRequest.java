package br.com.sol7.olimpio.educacao.oferecimentocurso;

import java.util.Date;
import java.util.List;

public record GerarAulaCursoSequenciaRequest(Long grupoId,Date dataInicio,List<Long> diasAulaSelecionado,
        Long salaId,Long professorId){}
