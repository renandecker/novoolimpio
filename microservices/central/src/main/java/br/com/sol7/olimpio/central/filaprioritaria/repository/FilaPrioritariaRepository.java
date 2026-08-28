package br.com.sol7.olimpio.central.filaprioritaria;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

@ApplicationScoped
public class FilaPrioritariaRepository implements PanacheRepository<FilaPrioritaria> {

    public Uni<List<FilaPrioritaria>> buscarPorUsuario(Long usuarioId) {
        return find("usuarioId = ?1 order by data asc", usuarioId).list();
    }

    public Uni<List<FilaPrioritaria>> buscarPorOrdemLigacao(Long ordemLigacaoId) {
        return find("ordemLigacaoId = ?1 order by data asc", ordemLigacaoId).list();
    }

    public Uni<FilaPrioritaria> buscarProximaRetorno(Long usuarioId) {
        return find("usuarioId = ?1 and status = 'AGUARDANDO' and data <= CURRENT_TIMESTAMP order by data asc", usuarioId)
                .firstResult();
    }

    public Uni<Long> contarPorUsuarioEStatus(Long usuarioId, String status) {
        return count("usuarioId = ?1 and status = ?2", usuarioId, status);
    }
}