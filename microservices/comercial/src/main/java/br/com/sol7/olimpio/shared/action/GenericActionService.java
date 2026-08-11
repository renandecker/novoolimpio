package br.com.sol7.olimpio.shared.action;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Map;
@ApplicationScoped @WithTransaction public class GenericActionService {

    private static final String ACTION_REGEX = "(autocomplete|buscar|verif[a-z]*|carrega[a-z]*|atualizar[a-z]*|ajust[a-z]*|gerar[a-z]*|imprimir[a-z]*|export[a-z]*|import[a-z]*|obter[a-z]*|preparar[a-z]*|listar[a-z]*|entrar[a-z]*|acessar[a-z]*|trocar[a-z]*|remover[a-z]*|adicionar[a-z]*|aplicar[a-z]*|solicitar[a-z]*|validar[a-z]*|confirmar[a-z]*|salvar[a-z]*|executar[a-z]*|calcular[a-z]*|estornar[a-z]*|recalcular[a-z]*)";

    /**
     * Catalogo de acoes por recurso (feature), extraido das telas legadas (olimpio.zip).
     * Alimenta GET /api/comercial/actions/catalog e os botoes por linha no frontend.
     */
    private static final Map<String, List<String>> CATALOG = Map.ofEntries(
            Map.entry("campanha", List.of("aplicarFiltros", "carregarCampos", "listarAcoesDeCampanha")),
            Map.entry("campo", List.of("removerCampos")),
            Map.entry("consultor", List.of("aplicarAjuteGrupoMatricula", "aplicarDesconto", "aplicarDescontoBolsa", "carregarProspectoParaVisualizacao", "gerarContrato", "gerarPromissoria", "listarAgenda", "listarDiasAula", "obterValorCurso", "removerDesconto", "salvarFilaPrioritaria", "salvarPessoaFisica", "salvarPessoaJuridica", "verificaAluno")),
            Map.entry("indicador", List.of("adicionarMeta", "carregarDetalhesMetaSemana", "carregarDetalhesMetas", "carregarDetalhesMetasDia", "removerMeta", "verificaMes")),
            Map.entry("prospecto", List.of("atualizarRadar", "autoComplete", "carregarFormularioDaAcao", "carregarHistoricoLigacao", "carregarOutrosProspecto", "carregarProspectoParaVisualizacao", "carregarQuantidadeLigacao", "removerProspecto", "removerProspectoLink", "salvar", "salvarSelecionados")));

    public Uni<Map<String, List<String>>> catalog() {
        return Uni.createFrom().item(CATALOG);
    }

    public Uni<ActionResponse> execute(String module,String resource,String action,ActionRequest request){
        var normalized=action.toLowerCase();
        if(!normalized.matches(ACTION_REGEX)) return Uni.createFrom().failure(new IllegalArgumentException("Acao nao permitida: "+action));
        return Uni.createFrom().item(new ActionResponse(module,resource,action,"ACCEPTED",request.payload()));
    }
}
