package br.com.sol7.olimpio.relatorios.mapa;

import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.ws.rs.NotFoundException;

import java.util.List;

@ApplicationScoped
@WithTransaction
public class MapaRegraService {

    @Inject
    MapaRegraRepository repository;

    public Uni<List<MapaRegraResponse>> findByMapaId(Long mapaId) {
        return repository.findByMapaId(mapaId)
                .map(items -> items.stream().map(this::toResponse).toList());
    }

    private MapaRegraResponse toResponse(MapaRegra e) {
        return new MapaRegraResponse(e.id, e.descricao, e.cor, e.meta, e.meta2, e.markerTamanho, e.condicao, e.ativo, e.medidaId, e.medidaMetaId, e.medidaMetaDoisId, e.coresId, e.mapaId);
    }
}