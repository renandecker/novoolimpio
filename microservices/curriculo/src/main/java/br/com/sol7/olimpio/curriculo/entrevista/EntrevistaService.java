package br.com.sol7.olimpio.curriculo.entrevista;

import br.com.sol7.olimpio.shared.PagedResponse;
import br.com.sol7.olimpio.shared.RefOption;
import br.com.sol7.olimpio.shared.RefService;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import io.smallrye.mutiny.unchecked.Unchecked;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@ApplicationScoped
@WithTransaction
public class EntrevistaService {

    @Inject
    EntrevistaRepository repository;

    @Inject
    EntrevistaAgendaRepository agendaRepository;

    @Inject
    RefService refService;

    public Uni<List<EntrevistaResponse>> list() {
        return repository.listAll().onItem().transformToUni(items ->
                Uni.combine().all().unis(items.stream().map(this::toResponse).toList())
                        .combinedWith(results -> results.stream().map(r -> (EntrevistaResponse) r).toList()));
    }

    public Uni<PagedResponse<EntrevistaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = switch (size) {
            case 10, 20, 50, 100 -> size;
            default -> 10;
        };
        return repository.findAll().page(p, s).list()
                .onItem().transformToUni(items ->
                        Uni.combine().all().unis(items.stream().map(this::toResponse).toList())
                                .combinedWith(results -> results.stream().map(r -> (EntrevistaResponse) r).toList())
                                .chain(responses -> repository.count()
                                        .map(count -> new PagedResponse<>(responses, count, p, s))));
    }

    public Uni<EntrevistaResponse> find(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Entrevista não encontrada: " + id))
                .onItem().transformToUni(this::toResponse);
    }

    public Uni<EntrevistaResponse> create(EntrevistaRequest request) {
        Entrevista entrevista = new Entrevista();
        apply(entrevista, request);
        return repository.persist(entrevista)
                .chain(v -> syncAgendas(entrevista.id, request.agendas()))
                .onItem().transformToUni(v -> toResponse(entrevista));
    }

    public Uni<EntrevistaResponse> update(Long id, EntrevistaRequest request) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Entrevista não encontrada: " + id))
                .chain(entrevista -> {
                    apply(entrevista, request);
                    return repository.persistAndFlush(entrevista)
                            .chain(v -> syncAgendas(entrevista.id, request.agendas()))
                            .onItem().transformToUni(v -> toResponse(entrevista));
                });
    }

    public Uni<Void> delete(Long id) {
        return repository.findById(id)
                .onItem().ifNull().failWith(() -> new NotFoundException("Entrevista não encontrada: " + id))
                .chain(entrevista -> EntrevistaAgenda.delete("entrevistaId", entrevista.id)
                        .chain(v -> repository.delete(entrevista)));
    }

    public Uni<Map<String, List<RefOption>>> refs() {
        return refService.resolve(Map.of(
                "id_usuario",
                "SELECT id, login FROM bas_usuario ORDER BY 2 LIMIT 200",
                "id_vaga",
                "SELECT id, nome FROM cur_vaga ORDER BY 2 LIMIT 200",
                "id_empresa",
                "SELECT p.id, COALESCE(pf.nome, pj.nome_fantasia, pj.razao_social, p.email) " +
                        "FROM cur_empresa e " +
                        "JOIN bas_pessoa p ON p.id = e.id_pessoa " +
                        "LEFT JOIN bas_pessoa_fisica pf ON pf.id_pessoa = p.id " +
                        "LEFT JOIN bas_pessoa_juridica pj ON pj.id_pessoa = p.id " +
                        "ORDER BY 2 LIMIT 200",
                "agendas",
                "SELECT id, descricao FROM bas_agenda ORDER BY 2 LIMIT 200"));
    }

    private Uni<Void> syncAgendas(Long entrevistaId, List<Long> agendas) {
        if (agendas == null || agendas.isEmpty()) {
            return EntrevistaAgenda.delete("entrevistaId", entrevistaId).replaceWithVoid();
        }
        return EntrevistaAgenda.delete("entrevistaId", entrevistaId)
                .chain(v -> {
                    List<EntrevistaAgenda> entities = new ArrayList<>();
                    agendas.forEach(id -> {
                        EntrevistaAgenda e = new EntrevistaAgenda();
                        e.entrevistaId = entrevistaId;
                        e.agendaId = id;
                        entities.add(e);
                    });
                    return agendaRepository.persist(entities);
                });
    }

    private void apply(Entrevista entrevista, EntrevistaRequest request) {
        entrevista.usuarioId = request.id_usuario();
        entrevista.vagaId = request.id_vaga();
        entrevista.empresaId = request.id_empresa();
        entrevista.token = request.token();
        entrevista.flEmailEnviadoAluno = request.fl_email_enviado_aluno();
        entrevista.flEmailEnviadoEmpresa = request.fl_email_enviado_empresa();
        entrevista.flResposta = request.fl_resposta();
        entrevista.dataFinal = request.data_final();
        entrevista.dataAceiteAluno = request.data_aceite_aluno();
    }

    private Uni<EntrevistaResponse> toResponse(Entrevista entrevista) {
        io.quarkus.hibernate.reactive.panache.PanacheQuery<EntrevistaAgenda> query =
                EntrevistaAgenda.find("entrevistaId", entrevista.id);
        return query.list()
                .map(agendas -> new EntrevistaResponse(
                        entrevista.id,
                        entrevista.usuarioId,
                        entrevista.vagaId,
                        entrevista.empresaId,
                        entrevista.token,
                        entrevista.flEmailEnviadoAluno,
                        entrevista.flEmailEnviadoEmpresa,
                        entrevista.flResposta,
                        entrevista.dataFinal,
                        entrevista.dataAceiteAluno,
                        agendas.stream().map(a -> a.agendaId).toList()));
    }
}
