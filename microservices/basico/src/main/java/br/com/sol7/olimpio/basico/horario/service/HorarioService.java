package br.com.sol7.olimpio.basico.horario.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import java.util.Date;
import br.com.sol7.olimpio.basico.horario.dto.HorarioRequest;
import br.com.sol7.olimpio.basico.horario.dto.HorarioResponse;
import br.com.sol7.olimpio.basico.horario.entity.Horario;
import br.com.sol7.olimpio.basico.horario.repository.HorarioRepository;

@ApplicationScoped
@WithTransaction
public class HorarioService {

    @Inject HorarioRepository repository;

    public Uni<List<HorarioResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<HorarioResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<HorarioResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Horario not found"))
                .map(this::toResponse);
    }

    public Uni<HorarioResponse> create(HorarioRequest r) {
        var e = new Horario();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<HorarioResponse> update(Long id, HorarioRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Horario not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Horario not found")));
    }

    private void apply(Horario e, HorarioRequest r) { e.hora = r.hora(); }

    private HorarioResponse toResponse(Horario e) {
        return new HorarioResponse(e.id, e.hora);
    }


    // Migrado de HorarioController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/basico/HorarioController.java:78, camada controller)
    // Logica original (adaptar):
    // public List<Horario> autoComplete(String query) {
    //         return horarioService.autoComplete(query);
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase().trim()).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de HorarioService.buscarHorarioPorHora (src/main/java/br/com/sol7/olimpio/service/services/basico/HorarioService.java:26, camada service)
    // Observacao: retorno: era Horario (referencia por id)
    // Logica original (adaptar):
    // public Horario buscarHorarioPorHora(String hora) {
    //         return getHorarioRepository().buscarHorarioPorHora(hora);
    //     }
    public Uni<Long> buscarHorarioPorHora(String hora) {
                return repository.find("hora = ?1", hora).firstResult().map(x -> x == null ? null : x.id);
    }


    // Migrado de HorarioService.buscarHorariosPrenchidos (src/main/java/br/com/sol7/olimpio/service/services/basico/HorarioService.java:47, camada service)
    // Observacao: parametro agendaId: era Agenda (referencia por id)
    // JPQL original: select c2.horario from Compromisso c2 where c2.agenda = ?1 AND c2.data = ?2
    // Logica original (adaptar):
    // public List<Horario> buscarHorariosPrenchidos(Agenda agenda, Date data) {
    //         return getHorarioRepository().buscarHorariosPrenchidos(agenda, data);
    //     }
    public Uni<List<Long>> buscarHorariosPrenchidos(Long agendaId, Date data) {
        return repository.buscarHorariosPrenchidos(agendaId, data)
                .map(list -> list.stream().map(x -> ((Number) x).longValue()).toList());
    }

}
