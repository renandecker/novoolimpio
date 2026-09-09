package br.com.sol7.olimpio.relatorios.estruturacoluna.repository;
import br.com.sol7.olimpio.relatorios.estruturacoluna.entity.EstruturaColuna;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class EstruturaColunaRepository implements PanacheRepository<EstruturaColuna> {

    public Uni<List<EstruturaColuna>> findByEstruturaId(Long estruturaId) {
        return list("estruturaId", estruturaId);
    }
}