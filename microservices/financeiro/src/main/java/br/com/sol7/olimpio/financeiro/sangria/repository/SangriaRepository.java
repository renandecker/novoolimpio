package br.com.sol7.olimpio.financeiro.sangria.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.financeiro.sangria.entity.Sangria;

@ApplicationScoped
public class SangriaRepository implements PanacheRepository<Sangria> {
    // Migrado de SangriaService.buscarSangriaCaixa (legado) - HQL original: select s from Sangria s where s.caixa = ?1
    public Uni<List<Sangria>> buscarPorCaixa(Long caixaId) {
        return find("caixaId = ?1 order by data", caixaId).list();
    }
}
