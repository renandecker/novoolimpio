package br.com.sol7.olimpio.shared.action;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni; import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Map;
@ApplicationScoped @WithTransaction public class GenericActionService {

    private static final String ACTION_REGEX = "(autocomplete|buscar|verif[a-z]*|carregar[a-z]*|carrega[a-z]*|atualizar[a-z]*|ajust[a-z]*|gerar[a-z]*|imprimir[a-z]*|export[a-z]*|import[a-z]*|obter[a-z]*|preparar[a-z]*|listar[a-z]*|entrar[a-z]*|acessar[a-z]*|trocar[a-z]*|remover[a-z]*|adicionar[a-z]*|aplicar[a-z]*|solicitar[a-z]*|validar[a-z]*|confirmar[a-z]*|salvar[a-z]*|executar[a-z]*|calcular[a-z]*|estornar[a-z]*|recalcular[a-z]*)";

    /**
     * Catálogo de ações por recurso (feature), extraído das telas legadas (olimpio.zip).
     * Alimenta GET /api/basico/actions/catalog e os botões por linha no frontend.
     */
    private static final Map<String, List<String>> CATALOG = Map.ofEntries(
            Map.entry("agenda", List.of("carregarUsuarios")),
            Map.entry("bairro", List.of("atualizarLogradouro")),
            Map.entry("cidade", List.of("atualizarLogradouro")),
            Map.entry("compromisso", List.of("obterCompromissoSchedule")),
            Map.entry("feriado", List.of("carregaOcorrenciaFeriadoAjuste")),
            Map.entry("logradouro", List.of("atualizarLogradouro")),
            Map.entry("modulo", List.of("carregarPerfis")),
            Map.entry("oferecimentoComponenteCurricular", List.of("prepararEdicao")),
            Map.entry("oferecimentoCurso", List.of("prepararEdicao")),
            Map.entry("operacional", List.of("buscarProspectos")),
            Map.entry("perfil", List.of("carregarUsuarios")),
            Map.entry("produto", List.of("entradaProduto")),
            Map.entry("turma", List.of("carregarInformacoes", "listarMatriculas")),
            Map.entry("unidade", List.of("carregarUsuarios", "carregarPessoas", "carregarProfessores", "carregarCurriculos")));

    public Uni<Map<String, List<String>>> catalog() {
        return Uni.createFrom().item(CATALOG);
    }

    public Uni<ActionResponse> execute(String module,String resource,String action,ActionRequest request){
        var normalized=action.toLowerCase();
        if(!normalized.matches(ACTION_REGEX)) return Uni.createFrom().failure(new IllegalArgumentException("Acao nao permitida: "+action));
        return Uni.createFrom().item(new ActionResponse(module,resource,action,"ACCEPTED",request.payload()));
    }
}
