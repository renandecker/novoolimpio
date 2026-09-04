package br.com.sol7.olimpio.educacao.sala;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class SalaService {

    @Inject
    SalaRepository repository;

    public Uni<List<SalaResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<SalaResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<SalaResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Sala not found"))
                .map(this::toResponse);
    }

    public Uni<SalaResponse> create(SalaRequest r) {
        var e = new Sala();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<SalaResponse> update(Long id, SalaRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Sala not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Sala not found")));
    }

    private void apply(Sala e, SalaRequest r) {
        e.descricao = r.descricao();
        e.sucinto = r.sucinto();
        e.unidadeId = r.unidadeId();
        e.tipoSalaId = r.tipoSalaId();
        e.quantidadeAlunos = r.quantidadeAlunos();
        e.predio = r.predio();
        e.andar = r.andar();
        e.numero = r.numero();
        e.arCondicionado = r.arCondicionado();
        e.ensalamentoAutomatico = r.ensalamentoAutomatico();
    }

    private SalaResponse toResponse(Sala e) {
        return new SalaResponse(e.id, e.descricao, e.sucinto, e.unidadeId, e.tipoSalaId, e.quantidadeAlunos, e.predio, e.andar, e.numero, e.arCondicionado, e.ensalamentoAutomatico);
    }


    // Migrado de SalaController.ajustarTodosOferecimentos (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/SalaController.java:98, camada controller)
    // Logica original (adaptar):
    // public String ajustarTodosOferecimentos() {
    //         for (OferecimentoComponenteCurricular o : oferecimentoComponenteCurriculars) {
    //             oferecimentoComponenteCurricularService.atulizarVagasOferecimento(o, getEntity().getQuantidadeAlunos());
    //             oferecimentoComponenteCurricularService.atulizarStatosInscritosOferecimento(o);
    //             oferecimentoComponenteCurricularService.atulizarSalasOferecimentoComOferecimento(o);
    //         }
    //         return saveOrUpdateOferecimento();
    //     }
    public Uni<String> ajustarTodosOferecimentos() {
        // Obs: regra de negocio original depende do estado da tela (lista oferecimentoComponenteCurriculars) e do microservico oferecimento-componente-curricular
        return Uni.createFrom().item(null);
    }


    // Migrado de SalaController.ajustarMarcadosOferecimentos (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/SalaController.java:107, camada controller)
    // Logica original (adaptar):
    // public String ajustarMarcadosOferecimentos() {
    //         if (ObjectUtil.nullOrEmpty(oferecimentoComponenteCurricularsSelect)) {
    //             RequestContext.getCurrentInstance().execute("PF('trocarTurma').show();");
    //             MessageUtil.sendMessageToUser(MessageUtil.MessageUtilType.INFO, "global.warning", "validation", "Selecione algum oferecimento");
    //             return null;
    //         }
    //         for (OferecimentoComponenteCurricular o : oferecimentoComponenteCurricularsSelect) {
    //             oferecimentoComponenteCurricularService.atulizarVagasOferecimento(o, getEntity().getQuantidadeAlunos());
    //             oferecimentoComponenteCurricularService.atulizarStatosInscritosOferecimento(o);
    //            ...
    // // ... (truncado, ver fonte original)
    public Uni<String> ajustarMarcadosOferecimentos() {
        // Obs: regra de negocio original depende do estado da tela (oferecimentoComponenteCurricularsSelect) e do microservico oferecimento-componente-curricular
        return Uni.createFrom().item(null);
    }


    // Migrado de SalaController.ajustarNenhum (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/SalaController.java:124, camada controller)
    // Logica original (adaptar):
    // public String ajustarNenhum() {
    //         return saveOrUpdateOferecimento();
    //     }
    public Uni<String> ajustarNenhum() {
        // Obs: regra de negocio original e de persistencia/UI (saveOrUpdateOferecimento)
        return Uni.createFrom().item(null);
    }


    // Migrado de SalaService.buscarSalasDaUnidade (src/main/java/br/com/sol7/olimpio/service/services/educacao/SalaService.java:22, camada service)
    // Observacao: parametro unidadeId: era Unidade (referencia por id)
    // Logica original (adaptar):
    // public List<Sala> buscarSalasDaUnidade(Unidade unidade) {
    //         return getSalaRepository().buscarSalasDaUnidade(unidade);
    //     }
    public Uni<List<Long>> buscarSalasDaUnidade(Long unidadeId) {
        return repository.find("unidadeId = ?1 order by sucinto", unidadeId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

