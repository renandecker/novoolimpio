package br.com.sol7.olimpio.relatorios.dimensao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class DimensaoRepository implements PanacheRepository<Dimensao> {

    public Uni<List<Dimensao>> findByEstruturaId(Long estruturaId) {
        return list("estruturaId", estruturaId);
    }

    public Uni<List<Dimensao>> autoComplete(String query, Long estruturaId) {
        String searchPattern = "%" + query.toLowerCase() + "%";
        return find("(lower(nomeVisualizacao) like ?1 or lower(tipo) like ?1) and estruturaId = ?2", searchPattern, searchPattern, estruturaId)
                .page(Page.ofSize(10))
                .list();
    }
}