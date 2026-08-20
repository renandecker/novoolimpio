package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record NotasDto(TurmaDto turma,String tipoGrau,Integer notasParciais,Double mediaSemExame,
        Double mediaFinal,Double notaMaxima,Boolean recuperacao,Boolean manual,
        Boolean manualAluno,Boolean pesoDistinto,Double frequenciaMinima,
        List<GrauNotaDto> grauNotas,List<GrauConceitoDto> grauConceitos,
        List<NotaAlunoDto> avaliacoes){
        }
