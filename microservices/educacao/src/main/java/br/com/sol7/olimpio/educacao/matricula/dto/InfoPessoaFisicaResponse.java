package br.com.sol7.olimpio.educacao.matricula;

/**
 * Painéis informativos exibidos na tela de matrícula ao selecionar um aluno
 * (migrado de MatriculaController.verificaAluno do legado).
 *
 * Valores possíveis:
 * - maioridade: "DE MAIOR" | "DE MENOR"
 * - financeiro: "SEM DÍVIDAS" | "COM DÍVIDAS"
 * - aluno: "SIM" | "NÃO"
 * - atualizarDados: "SIM" | "NÃO"
 */
public record InfoPessoaFisicaResponse(
        String maioridade,
        String financeiro,
        String aluno,
        String atualizarDados) {
}
