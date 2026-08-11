package br.com.sol7.olimpio.shared.action;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Map;
@ApplicationScoped @WithTransaction public class GenericActionService {

    private static final String ACTION_REGEX = "(autocomplete|buscar|verif[a-z]*|carrega[a-z]*|atualizar[a-z]*|ajust[a-z]*|gerar[a-z]*|imprimir[a-z]*|export[a-z]*|import[a-z]*|obter[a-z]*|preparar[a-z]*|listar[a-z]*|entrar[a-z]*|acessar[a-z]*|trocar[a-z]*|remover[a-z]*|adicionar[a-z]*|aplicar[a-z]*|solicitar[a-z]*|validar[a-z]*|confirmar[a-z]*|salvar[a-z]*|executar[a-z]*|calcular[a-z]*|estornar[a-z]*|recalcular[a-z]*)";

    /**
     * Catalogo de acoes por recurso (feature), extraido das telas legadas (olimpio.zip).
     * Alimenta GET /api/educacao/actions/catalog e os botoes por linha no frontend.
     */
    private static final Map<String, List<String>> CATALOG = Map.ofEntries(
            Map.entry("chamadaAssinada", List.of("carregarInformacoes", "gerarChamadaAssinadaPaisagem", "gerarChamadaAssinadaRetrato")),
            Map.entry("componenteCurricular", List.of("removeReferenciaBibliografica")),
            Map.entry("criterio", List.of("salvar")),
            Map.entry("curriculo", List.of("aplicarRegrasReplicacao", "calcularCargaHoraria", "removeReferenciaBibliografica", "removeRequisito", "removerFIltro", "salvarComponenteCurricular")),
            Map.entry("desistente", List.of("ajusteManualValorReparcela", "aplicarCancelamentoContrato", "aplicarCancelamentoMatricula", "aplicarPreCancelamento", "atualizarValorCancelamento", "carregaPreCancelamento", "carregarPreCancelamentosContrato", "carregarRequerimentoCancelamentoContrato", "executarReparcelamento", "gerarContrato", "gerarPrevisaoContratual", "gerarPrevisaoMatricula", "gerarPromissoria", "gerarRequerimentoCancelamento", "gerarViaDocumentoCancelamentoContratual", "listarContratos", "obterHorarioAula", "prepararReparcelamento", "prepararReparcelas", "verificaImpressaoCancelamento", "verificarPreCancelamento")),
            Map.entry("digitalizacaoDocumento", List.of("carregarDiasAula", "carregarDocumentosAluno", "carregarOcorrencia", "salvarChamada", "verificarPresenca")),
            Map.entry("gestaoAluno", List.of("ajustarResponsavel", "ajustarUnidadeResponsavel", "ajusteManualValorReparcela", "aplicarCancelamentoContrato", "aplicarCancelamentoMatricula", "aplicarPreCancelamento", "atualizarDataVencimento", "atualizarDescontoParcela", "atualizarJurosParcela", "atualizarMultaParcela", "atualizarValorCancelamento", "atualizarValorVencimento", "carregaPreCancelamento", "carregaSegunaViaTrocaAlunosContrato", "carregaSegunaViaTrocaAlunosMatricula", "carregaSegunaViaTrocaAlunosTurmaContrato", "carregaSegunaViaTrocaAlunosTurmaContratoSelecionado", "carregaSegunaViaTrocaAlunosTurmaMatricula", "carregaTrocaAlunosContratoPresenca", "carregaTrocaAlunosMatriculaPresenca", "carregaTrocaAlunosPessoaPresenca", "carregarComponentesDisponiveis", "carregarHistoricoCobranca", "carregarHistoricoNap", "carregarMatriculasContrato", "carregarMatriculasMatricula", "carregarMatriculasPessoa", "carregarNovaParcela", "carregarPreCancelamentosContrato", "carregarPreCancelamentosMatricula", "carregarRequerimentoCancelamentoContrato", "carregarRequerimentoCancelamentoMatricula", "carregarResponsaveis", "carregarSituacao", "carregarTodasTurmas", "carregarTurmasDisponiveis", "executarReparcelamento", "gerarContrato", "gerarDocumentoTrocaTurma", "gerarDocumentoTrocaTurmaTodos", "gerarPrevisaoContratual", "gerarPrevisaoMatricula", "gerarPromissoria", "gerarRequerimentoCancelamento", "gerarViaDocumentoCancelamentoContratual", "gerarViaDocumentoCancelamentoMatricula", "imprimirHistorico", "imprimirSelecionadas", "listarContratos", "listarOaluno", "obterHorarioAula", "obterParcelas", "prepararAluno", "prepararDocumentos", "prepararReparcelamento", "prepararReparcelas", "removerDocumentoAluno", "removerDocumentoResponsavel", "salvarCompromissoHistoricoAluno", "trocaResponsaveis", "verificaImpressaoCancelamento", "verificarPreCancelamento")),
            Map.entry("grau", List.of("prepararListaGrau")),
            Map.entry("matricula", List.of("aplicarDesconto", "aplicarDescontoBolsa", "autoComplete", "calcularDesconto", "calcularVenda", "gerarContrato", "gerarPromissoria", "listarDiasAula", "listarTaxas", "obterFormasPagamento", "prepararBonificacao", "removerDesconto", "salvarFilaPrioritaria", "salvarPessoaFisica", "salvarPessoaJuridica", "verificaAluno", "verificaParcelado")),
            Map.entry("mensagemNap", List.of("adicionarVariavelMensagem")),
            Map.entry("nap", List.of("carregarContrato", "carregarDetalhes", "carregarNap", "obterHorarioAula", "salvar", "salvarLote")),
            Map.entry("oferecimentoComponenteCurricular", List.of("ajustaAula", "prepararEdicao", "prepararEdicaoSelecionado", "prepararEdicaoSelecionadoFilter", "prepararEdicaoSelecionadoSelected", "salvarPessoaFisica", "salvarPessoaJuridica", "verificaData")),
            Map.entry("sala", List.of("ajustarMarcadosOferecimentos", "ajustarNenhum", "ajustarTodosOferecimentos")),
            Map.entry("turma", List.of("adicionarAulaCoringa", "ajustadias", "carregaAlunosTurma", "carregaSegunaViaTrocaAlunosTurmaMatricula", "carregarComponentesDisponiveis", "carregarInformacoes", "carregarTurmasDisponiveis", "gerarDocumentoTrocaTurma", "imprimirDiarioClasse", "listarMatriculas", "obterProfessor", "obterSalas", "salvarCaderno", "salvarPessoaJuridica", "verificaMotivo", "verificaNota")),
            Map.entry("valorCurso", List.of("obterValorCurso", "obterValorHora")));

    public Uni<Map<String, List<String>>> catalog() {
        return Uni.createFrom().item(CATALOG);
    }

    public Uni<ActionResponse> execute(String module,String resource,String action,ActionRequest request){
        var normalized=action.toLowerCase();
        if(!normalized.matches(ACTION_REGEX)) return Uni.createFrom().failure(new IllegalArgumentException("Acao nao permitida: "+action));
        return Uni.createFrom().item(new ActionResponse(module,resource,action,"ACCEPTED",request.payload()));
    }
}
