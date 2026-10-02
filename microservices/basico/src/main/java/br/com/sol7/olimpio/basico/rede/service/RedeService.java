package br.com.sol7.olimpio.basico.rede.service;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import br.com.sol7.olimpio.shared.PagedResponse;

import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

import br.com.sol7.olimpio.basico.rede.dto.RedeRequest;
import br.com.sol7.olimpio.basico.rede.dto.RedeResponse;
import br.com.sol7.olimpio.basico.rede.entity.Rede;
import br.com.sol7.olimpio.basico.rede.repository.RedeRepository;
import br.com.sol7.olimpio.basico.unidade.dto.UnidadeResponse;
import br.com.sol7.olimpio.basico.unidade.entity.Unidade;
import br.com.sol7.olimpio.basico.unidade.repository.UnidadeRepository;

@ApplicationScoped
@WithTransaction
public class RedeService {

    @Inject
    RedeRepository repository;
    @Inject
    UnidadeRepository unidadeRepository;

    public Uni<List<RedeResponse>> list() {
        return repository.listAll().map(items -> items.stream().map(this::toResponse).toList());
    }

    public Uni<PagedResponse<RedeResponse>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.findAll(io.quarkus.panache.common.Sort.by("id").descending()).page(io.quarkus.panache.common.Page.of(p, s)).list()
                .onItem().transformToUni(items -> repository.count()
                        .map(count -> new PagedResponse<>(items.stream().map(this::toResponse).toList(), count, p, s)));
    }


    public Uni<RedeResponse> find(Long id) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Rede not found"))
                .map(this::toResponse);
    }

    public Uni<RedeResponse> create(RedeRequest r) {
        var e = new Rede();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<RedeResponse> update(Long id, RedeRequest r) {
        return repository.findById(id).onItem().ifNull()
                .failWith(() -> new NotFoundException("Rede not found"))
                .invoke(e -> apply(e, r))
                .map(this::toResponse);
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("Rede not found")));
    }

    private void apply(Rede e, RedeRequest r) {
        e.layoutId = r.layoutId();
        e.usuarioId = r.usuarioId();
        e.razaoSocial = r.razaoSocial();
        e.nomeFantasia = r.nomeFantasia();
        e.cnpj = r.cnpj();
        e.numero = r.numero();
    }

    private RedeResponse toResponse(Rede e) {
        return new RedeResponse(e.id, e.layoutId, e.usuarioId, e.razaoSocial, e.nomeFantasia, e.cnpj, e.numero);
    }


    public Uni<List<UnidadeResponse>> buscarDetalhes(Long redeId) {
        return repository.findById(redeId).onItem().ifNull()
                .failWith(() -> new NotFoundException("Rede not found"))
                .chain(rede -> unidadeRepository.buscaUnidadesComRede(redeId))
                .map(items -> items.stream().map(this::toUnidadeResponse).toList());
    }


    // Migrado de RedeService.autoComplete (src/main/java/br/com/sol7/olimpio/service/services/basico/RedeService.java:24, camada service)
    // JPQL original: select r from Rede r where lower(r.nomeFantasia) like '%' || ?1 || '%' OR lower(r.cnpj) like '%' || ?1 || '%' OR lower(r.razaoSocial) like '%' || ?1 || '%' OR str(r.id) = ?1 order by r.nomeFantasia
    // Logica original (adaptar):
    // public List<Rede> autoComplete(String query) {
    //         return getRedeRepository().autoComplete(query.toLowerCase(), new PageRequest(0, 10)).getContent();
    //     }
    public Uni<List<Long>> autoComplete(String query) {
        return repository.autoComplete(query.toLowerCase()).map(list -> list.stream().map(x -> x.id).toList());
    }

    private UnidadeResponse toUnidadeResponse(Unidade u) {
        return new UnidadeResponse(u.id, u.razaoSocial, u.nomeFantasia, u.CNPJ, u.inscricaoEstadual,
                u.logradouroId, u.email, u.numero, u.area, u.emailRH, u.tipoUnidadeId, u.regiaoId,
                u.responsavelId, u.layoutId, u.pontoReferencia, u.sucinto, u.diretorEnsino,
                u.coordenador, u.cep, u.registro, u.ativo);
    }

}
