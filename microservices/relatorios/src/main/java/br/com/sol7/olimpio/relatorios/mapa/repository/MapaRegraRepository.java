package br.com.sol7.olimpio.relatorios.mapa;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class MapaRegraRepository implements PanacheRepository<MapaRegra> {

    public Uni<List<MapaRegra>> findByMapaId(Long mapaId) {
        return list("mapaId", mapaId);
    }

    public Uni<Long> countByMapaId(Long mapaId) {
        return count("mapaId", mapaId);
    }
}