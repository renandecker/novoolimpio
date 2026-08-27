package br.com.sol7.olimpio.shared.action;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Map;
@ApplicationScoped @WithTransaction public class GenericActionService {

    private static final String ACTION_REGEX = "(autocomplete|buscar|verif[a-z]*|carrega[a-z]*|atualizar[a-z]*|ajust[a-z]*|gerar[a-z]*|imprimir[a-z]*|export[a-z]*|import[a-z]*|obter[a-z]*|preparar[a-z]*|listar[a-z]*|entrar[a-z]*|acessar[a-z]*|trocar[a-z]*|remover[a-z]*|adicionar[a-z]*|aplicar[a-z]*|solicitar[a-z]*|validar[a-z]*|confirmar[a-z]*|salvar[a-z]*|executar[a-z]*|calcular[a-z]*|estornar[a-z]*|recalcular[a-z]*|iniciarLigacao)";

    /**
     * Catalogo de acoes por recurso (feature), extraido das telas legadas (olimpio.zip).
     * Alimenta GET /api/financeiro/actions/catalog e os botoes por linha no frontend.
     */
    private static final Map<String, List<String>> CATALOG = Map.ofEntries(
            Map.entry("caixa", List.of("confirmarImpressao", "verificarCotaImpressao")),
            Map.entry("cobranca", List.of("calcularTotalCartas", "calcularTotalEmails", "calcularTotalLigacoes", "calcularValorTotal", "carregarCobrancas", "carregarContrato", "carregarDetalhes", "obterHorarioAula", "obterIdadeAluno", "salvar", "salvarLote", "iniciarLigacao")),
            Map.entry("conta", List.of("ajustarSituacao", "aplicarPago", "calcularPagamento", "listarPagamento", "verificaData")),
            Map.entry("etapasCobranca", List.of("removeResultado")),
            Map.entry("mensagem", List.of("adicionarVariavelMensagem")),
            Map.entry("mensagemCobranca", List.of("adicionarVariavelMensagem")),
            Map.entry("pagamento", List.of("acessarFechamentoCaixa", "adicionarCarinho", "carregaCaixa", "obterFormasPagamento", "obterNumeroLancamentoParcela", "obterParcelaComCodigo", "prepararPromocao", "removerFIltro", "salvar", "salvarPagamento", "verificaItemEscolhiido", "verificaParcelado")));

    public Uni<Map<String, List<String>>> catalog() {
        return Uni.createFrom().item(CATALOG);
    }

    public Uni<ActionResponse> execute(String module,String resource,String action,ActionRequest request){
        var normalized=action.toLowerCase();
        if(!normalized.matches(ACTION_REGEX)) return Uni.createFrom().failure(new IllegalArgumentException("Acao nao permitida: "+action));
        return Uni.createFrom().item(new ActionResponse(module,resource,action,"ACCEPTED",request.payload()));
    }
}
