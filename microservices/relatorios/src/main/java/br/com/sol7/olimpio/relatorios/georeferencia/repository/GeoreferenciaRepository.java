package br.com.sol7.olimpio.relatorios.georeferencia.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.quarkus.panache.common.Page;
import br.com.sol7.olimpio.relatorios.georeferencia.entity.Georeferencia;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class GeoreferenciaRepository implements PanacheRepository<Georeferencia> {

    public Uni<List<Georeferencia>> findByEstruturaId(Long estruturaId) {
        return list("estruturaId", estruturaId);
    }

    public Uni<List<Georeferencia>> autoComplete(String query, Long estruturaId) {
        String searchPattern = "%" + query.toLowerCase() + "%";
        return find("(lower(nomeVisualizacao) like ?1) and estruturaId = ?2", searchPattern, estruturaId)
                .page(Page.ofSize(10))
                .list();
    }
}