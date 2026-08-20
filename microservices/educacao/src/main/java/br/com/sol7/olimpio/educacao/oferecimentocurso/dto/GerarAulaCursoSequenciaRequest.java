package br.com.sol7.olimpio.educacao.oferecimentocurso;

import java.util.Date;
import java.util.List;

// Migrado de OferecimentoCursoController.gerarAulaCursoSequencia (legado): dados do wizard de dias de aula.
public record GerarAulaCursoSequenciaRequest(Long grupoId,Date dataInicio,List<Long> diasAulaSelecionado,
        Long salaId,Long professorId){}
