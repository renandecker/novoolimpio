package br.com.sol7.olimpio.professor.gestao.dto;

import java.util.List;

public record InformacoesDto(
        Long turmaId,
        String professor,
        String professorTelefone,
        String professorCelular,
        String professorEmail,
        String unidade,
        String sala,
        String grupo,
        String curso,
        String componenteCurricular,
        String status,
        List<DiaAulaDto> diasAula,
        List<AlunoInfoDto> alunos) {

    public record DiaAulaDto(String data, String diaSemana, String turno) {
    }

    public record AlunoInfoDto(
            Long matriculaId,
            String aluno,
            String cpf,
            String telefone,
            String celular,
            String contratante,
            String contratanteCpf,
            String contratanteTelefone,
            String contratanteCelular) {
    }
}
