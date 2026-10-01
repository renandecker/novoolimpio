package br.com.sol7.olimpio.financeiro.sangria.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.financeiro.sangria.entity.Sangria;

@ApplicationScoped
public class SangriaRepository implements PanacheRepository<Sangria> {
    public Uni<List<Sangria>> buscarPorCaixa(Long caixaId) {
        return find("caixaId = ?1 order by data", caixaId).list();
    }
}
