package br.com.sol7.olimpio.relatorios.painel.repository;

import br.com.sol7.olimpio.relatorios.painel.entity.PainelTopico;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class PainelTopicoRepository implements PanacheRepository<PainelTopico> {

    public Uni<List<PainelTopico>> findByPainelId(Long painelId) {
        return list("painelId", painelId);
    }

    public Uni<Long> countByPainelId(Long painelId) {
        return count("painelId", painelId);
    }

    public Uni<Long> deleteByPainelId(Long painelId) {
        return delete("painelId", painelId);
    }
}