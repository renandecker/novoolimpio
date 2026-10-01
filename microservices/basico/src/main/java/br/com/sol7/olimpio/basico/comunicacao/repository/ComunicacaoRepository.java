package br.com.sol7.olimpio.basico.comunicacao.repository;

import br.com.sol7.olimpio.basico.comunicacao.entity.Comunicacao;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class ComunicacaoRepository implements PanacheRepository<Comunicacao> {

    public Uni<List<Comunicacao>> listAllOrderByIdDesc() {
        return findAll(io.quarkus.panache.common.Sort.by("id").descending()).list();
    }

    public Uni<PagedResponse<Comunicacao>> paged(int page, int size) {
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return findAll(io.quarkus.panache.common.Sort.by("id").descending())
                .page(Page.of(p, s))
                .list()
                .onItem().transformToUni(items -> count()
                        .map(count -> new PagedResponse<>(items, count, p, s)));
    }

    public Uni<List<Comunicacao>> findByIdUsuario(Integer idUsuario) {
        return find("idUsuario = ?1 order by id desc", idUsuario).list();
    }

    public Uni<List<Comunicacao>> findByStatus(Comunicacao.StatusComunicacao status) {
        return find("status = ?1 order by id desc", status).list();
    }

    public Uni<List<Comunicacao>> findByTipo(String tipo) {
        return find("tipo = ?1 order by id desc", tipo).list();
    }
}