package br.com.sol7.olimpio.basico.comunicacao.service;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;
import java.util.List;
import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoRequest;
import br.com.sol7.olimpio.basico.comunicacao.dto.ComunicacaoResponse;
import br.com.sol7.olimpio.basico.comunicacao.entity.Comunicacao;
import br.com.sol7.olimpio.basico.comunicacao.repository.ComunicacaoRepository;

@ApplicationScoped
@WithTransaction
public class ComunicacaoService {

    @Inject ComunicacaoRepository repository;

    public Uni<List<ComunicacaoResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<ComunicacaoResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<ComunicacaoResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Comunicacao not found"))
                .map(this::toResponse);
    }

    public Uni<ComunicacaoResponse> create(ComunicacaoRequest r) {
        var e = new Comunicacao();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<ComunicacaoResponse> update(Long id, ComunicacaoRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Comunicacao not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Comunicacao not found")));
    }

    private void apply(Comunicacao e, ComunicacaoRequest r) { e.usuarioId = r.usuarioId(); e.titulo = r.titulo(); e.mensagem = r.mensagem(); e.data = r.data(); }

    private ComunicacaoResponse toResponse(Comunicacao e) {
        return new ComunicacaoResponse(e.id, e.usuarioId, e.titulo, e.mensagem, e.data);
    }


    // Migrado de ComunicacaoService.buscarUnidade (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:29, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.unidades where u = ?1
    // Logica original (adaptar):
    // public List<Unidade> buscarUnidade(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarUnidade(comunicacao);
    //     }
    public Uni<List<Long>> buscarUnidade(Long comunicacaoId) {
                return repository.buscarUnidade(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscarPerfil (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:33, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.perfis where u = ?1
    // Logica original (adaptar):
    // public List<Perfil> buscarPerfil(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarPerfil(comunicacao);
    //     }
    public Uni<List<Long>> buscarPerfil(Long comunicacaoId) {
                return repository.buscarPerfil(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscarAgenda (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:37, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.agendas where u = ?1
    // Logica original (adaptar):
    // public List<Agenda> buscarAgenda(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarAgenda(comunicacao);
    //     }
    public Uni<List<Long>> buscarAgenda(Long comunicacaoId) {
                return repository.buscarAgenda(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscarPessoa (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:41, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.pessoas where u = ?1
    // Logica original (adaptar):
    // public List<Pessoa> buscarPessoa(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarPessoa(comunicacao);
    //     }
    public Uni<List<Long>> buscarPessoa(Long comunicacaoId) {
                return repository.buscarPessoa(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscarUsuario (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:45, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.usuarios where u = ?1
    // Logica original (adaptar):
    // public List<Usuario> buscarUsuario(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarUsuario(comunicacao);
    //     }
    public Uni<List<Long>> buscarUsuario(Long comunicacaoId) {
                return repository.buscarUsuario(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscaroferecimento (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:49, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.oferecimentos where u = ?1
    // Logica original (adaptar):
    // public List<OferecimentoComponenteCurricular> buscaroferecimento(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarOferecimento(comunicacao);
    //     }
    public Uni<List<Long>> buscaroferecimento(Long comunicacaoId) {
                return repository.buscarOferecimento(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscarComponente (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:53, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.componentes where u = ?1
    // Logica original (adaptar):
    // public List<ComponenteCurricular> buscarComponente(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarComponente(comunicacao);
    //     }
    public Uni<List<Long>> buscarComponente(Long comunicacaoId) {
                return repository.buscarComponente(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscarCurso (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:57, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.curriculos where u = ?1
    // Logica original (adaptar):
    // public List<Curriculo> buscarCurso(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarCurso(comunicacao);
    //     }
    public Uni<List<Long>> buscarCurso(Long comunicacaoId) {
                return repository.buscarCurso(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }


    // Migrado de ComunicacaoService.buscarGrupo (src/main/java/br/com/sol7/olimpio/service/services/basico/ComunicacaoService.java:61, camada service)
    // Observacao: parametro comunicacaoId: era Comunicacao (referencia por id)
    // JPQL original: select c from Comunicacao c inner join c.grupos where u = ?1
    // Logica original (adaptar):
    // public List<Grupo> buscarGrupo(Comunicacao comunicacao) {
    //         return getComunicacaoRepository().buscarGrupo(comunicacao);
    //     }
    public Uni<List<Long>> buscarGrupo(Long comunicacaoId) {
                return repository.buscarGrupo(comunicacaoId).map(list -> list.stream().map(x -> x.id).toList());
    }

}
