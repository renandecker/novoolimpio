package br.com.sol7.olimpio.central.ordemligacao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class OrdemLigacaoRepository implements PanacheRepository<OrdemLigacao> {

    public Uni<OrdemLigacao> buscarProximaOrdemLigacao(Long operacionalId) {
        return find("operacionalId = ?1 and status = 'AGUARDANDO' order by prioritaria desc, dataCriacao asc", operacionalId)
                .firstResult();
    }

    public Uni<List<OrdemLigacao>> buscarPorOperacional(Long operacionalId) {
        return find("operacionalId = ?1 order by prioritaria desc, dataCriacao asc", operacionalId).list();
    }

    public Uni<List<OrdemLigacao>> buscarPorProspecto(Long prospectoId) {
        return find("prospectoId = ?1 order by dataCriacao desc", prospectoId).list();
    }

    public Uni<Long> contarPorOperacionalEStatus(Long operacionalId, String status) {
        return count("operacionalId = ?1 and status = ?2", operacionalId, status);
    }

    public Uni<Long> contarPrioritariasPorOperacional(Long operacionalId) {
        return count("operacionalId = ?1 and status = 'AGUARDANDO' and prioritaria = true", operacionalId);
    }
}