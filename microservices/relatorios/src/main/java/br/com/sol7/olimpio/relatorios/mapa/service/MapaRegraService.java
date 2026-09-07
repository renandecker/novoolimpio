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

    public Uni<MapaRegraResponse> create(MapaRegraRequest r) {
        var e = new MapaRegra();
        apply(e, r);
        return repository.persist(e).replaceWith(() -> toResponse(e));
    }

    public Uni<Void> delete(Long id) {
        return repository.deleteById(id).onItem()
                .transformToUni(deleted -> deleted ? Uni.createFrom().voidItem()
                        : Uni.createFrom().failure(new NotFoundException("MapaRegra not found")));
    }

    private void apply(MapaRegra e, MapaRegraRequest r) {
        e.descricao = r.descricao();
        e.cor = r.cor();
        e.meta = r.meta();
        e.meta2 = r.meta2();
        e.markerTamanho = r.markerTamanho();
        e.condicao = r.condicao();
        e.ativo = r.ativo();
        e.medidaId = r.medidaId();
        e.medidaMetaId = r.medidaMetaId();
        e.medidaMetaDoisId = r.medidaMetaDoisId();
        e.coresId = r.coresId();
        e.mapaId = r.mapaId();
    }

    private MapaRegraResponse toResponse(MapaRegra e) {
        return new MapaRegraResponse(e.id, e.descricao, e.cor, e.meta, e.meta2, e.markerTamanho, e.condicao, e.ativo, e.medidaId, e.medidaMetaId, e.medidaMetaDoisId, e.coresId, e.mapaId);
    }
}