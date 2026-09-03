package br.com.sol7.olimpio.comercial.consultor;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class ConsultorService {

    @Inject
    ConsultorRepository repository;

    public Uni<List<ConsultorResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ConsultorResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ConsultorResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Consultor not found"))
                .map(this::toResponse);
    }

    public Uni<ConsultorResponse> create(ConsultorRequest r) {
        var e = new Consultor();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ConsultorResponse> update(Long id, ConsultorRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Consultor not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Consultor not found")));
    }

    private void apply(Consultor e, ConsultorRequest r) {
        e.usuarioId = r.usuarioId();
    }

    private ConsultorResponse toResponse(Consultor e) {
        return new ConsultorResponse(e.id, e.usuarioId);
    }

    private Uni<Void> validarSalvamento(Consultor e, ConsultorRequest r) {
        // Validacao: pelo menos uma agenda deve ser selecionada
        // Esta validacao sera realizada no controller/service de nivel superior
        // que tem acesso ao usuario e suas agendas

        // Validacao: pelo menos um turno de trabalho deve ser selecionado
        if (e.getTurnoTrabalhos() == null || e.getTurnoTrabalhos().isEmpty()) {
            return Uni.createFrom().item(null); // placeholder - validacao no controller
        }

        // Validacao: nao pode ter mais de 2 turnos no mesmo dia
        return Uni.createFrom().item(null);
    }


    // Migrado de ConsultorController.autoCompleteComUnidade (src/main/java/br/com/sol7/olimpio/control/controllers/comercial/ConsultorController.java:171, camada controller)
    // Logica original (adaptar):
    // public List<Usuario> autoCompleteComUnidade(String query) {
    //         return consultorService.autoCompleteComUnidade(query);
    //     }
    public Uni<List<Long>> autoCompleteComUnidade(String query, List<Long> unidadesIds) {
        if (unidadesIds == null || unidadesIds.isEmpty()) {
            return Uni.createFrom().item(java.util.List.of());
        }
        return repository.autoCompleteComUnidade(query.toLowerCase().trim(), unidadesIds).map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }


    // Migrado de ConsultorService.buscarConsultorComTurnos (src/main/java/br/com/sol7/olimpio/service/services/comercial/ConsultorService.java:34, camada service)
    // Observacao: retorno: era Consultor (referencia por id); parametro entityId: era Consultor (referencia por id)
    // JPQL original: Select c from Consultor c left join fetch c.turnoTrabalhos where c = ?1
    // Logica original (adaptar):
    // public Consultor buscarConsultorComTurnos(Consultor entity) {
    //         return getConsultorRepository().buscarConsultorComTurnos(entity);
    //     }
    public Uni<Long> buscarConsultorComTurnos(Long entityId) {
        return repository.buscarConsultorComTurnos(entityId).map(list -> list.isEmpty() ? null : list.get(0).id);
    }


    // Migrado de ConsultorService.buscarUsuarioNoConsultor (src/main/java/br/com/sol7/olimpio/service/services/comercial/ConsultorService.java:38, camada service)
    // Observacao: retorno: era Consultor (referencia por id); parametro entityId: era Usuario (referencia por id)
    // Logica original (adaptar):
    // public Consultor buscarUsuarioNoConsultor(Usuario entity) {
    //         return getConsultorRepository().buscarUsuarioNoConsultor(entity);
    //     }
    public Uni<Long> buscarUsuarioNoConsultor(Long entityId) {
        return repository.find("usuarioId = ?1", entityId).firstResult().map(x -> x == null ? null : x.id);
    }

}
