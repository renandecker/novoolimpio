package br.com.sol7.olimpio.educacao.grupo;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.educacao.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;

@ApplicationScoped
@WithTransaction
public class GrupoService {

    @Inject GrupoRepository repository;

    public Uni<List<GrupoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<GrupoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<GrupoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grupo not found"))
                .map(this::toResponse);
    }

    public Uni<GrupoResponse> create(GrupoRequest r) {
        var e = new Grupo();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<GrupoResponse> update(Long id, GrupoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Grupo not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Grupo not found")));
    }

    private void apply(Grupo e, GrupoRequest r) { e.unidadeId = r.unidadeId(); e.curriculoId = r.curriculoId(); e.nome = r.nome(); }

    private GrupoResponse toResponse(Grupo e) {
        return new GrupoResponse(e.id, e.unidadeId, e.curriculoId, e.nome);
    }


    // Migrado de GrupoController.autoComplete (src/main/java/br/com/sol7/olimpio/control/controllers/educacao/GrupoController.java:90, camada controller)
    // Logica original (adaptar):
    // public List<Grupo> autoComplete(String query) {
    //         if (query.equals("")) {
    //             return grupoService.unidadesGrupo(usuarioLogadoController.getUnidadesDisponiveis());
    //         }
    //         return grupoService.autoCompleteComUnidades(query.toLowerCase(), usuarioLogadoController.getUnidadesDisponiveis());
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        if (query.equals("")) {
            // Obs: condicao removida (depende de outro microservico): grupo.unidade in (unidadesDisponiveis do usuario logado)
            return repository.find("order by nome").page(io.quarkus.panache.common.Page.of(0, 10)).list().map(list -> list.stream().map(x -> x.id).toList());
        }
        return repository.find("(lower(nome) like '%' || ?1 || '%' OR str(id) = ?1) order by nome", query.toLowerCase()).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de GrupoService.autoCompleteComUnidades (src/main/java/br/com/sol7/olimpio/service/services/educacao/GrupoService.java:45, camada service)
    // Logica original (adaptar):
    // public List<Grupo> autoCompleteComUnidades(String lowerCase, List<Unidade> unidades) {
    //         return getGrupoRepository().autoCompleteComUnidades(lowerCase, unidades);
    //     }
    public Uni<List<Long>> autoCompleteComUnidades(String lowerCase, List<Long> unidades) {
                return repository.find("(lower(nome) like '%' || ?1 || '%'  OR str(id) = ?1) and unidadeId in (?2) order by nome", lowerCase, unidades).list().map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de GrupoService.autoCompleteComCurriculo (src/main/java/br/com/sol7/olimpio/service/services/educacao/GrupoService.java:53, camada service)
    // Observacao: parametro curriculoId: era Curriculo (referencia por id)
    // Logica original (adaptar):
    // public List<Grupo> autoCompleteComCurriculo(String lowerCase, Curriculo curriculo) {
    //         return getGrupoRepository().autoCompleteComCurriculo(lowerCase, curriculo);
    //     }
    public Uni<List<Long>> autoCompleteComCurriculo(String lowerCase, Long curriculoId) {
                return repository.find("(lower(nome) like '%' || ?1 || '%'  OR str(id) = ?1) and curriculoId = ?2 order by nome", lowerCase, curriculoId).list().map(list -> list.stream().map(x -> x.id).toList());
    }

}

