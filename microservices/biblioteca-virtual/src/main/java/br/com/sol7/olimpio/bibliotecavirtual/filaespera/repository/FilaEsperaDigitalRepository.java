package br.com.sol7.olimpio.bibliotecavirtual.filaespera.repository;

import br.com.sol7.olimpio.bibliotecavirtual.filaespera.entity.FilaEsperaDigital;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class FilaEsperaDigitalRepository implements PanacheRepository<FilaEsperaDigital> {

    public Uni<List<FilaEsperaDigital>> findByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and flAtivo = true order by dataSolicitacao", usuarioId);
    }

    public Uni<List<FilaEsperaDigital>> findByLivroDigitalId(Long livroDigitalId) {
        return list("livroDigital.id = ?1 and flAtivo = true order by posicaoFila", livroDigitalId);
    }

    public Uni<List<FilaEsperaDigital>> findAguardandoByLivroDigitalId(Long livroDigitalId) {
        return list("livroDigital.id = ?1 and status = ?2 and flAtivo = true order by posicaoFila",
                livroDigitalId, FilaEsperaDigital.StatusFila.AGUARDANDO);
    }

    public Uni<Long> countAguardandoByLivroDigitalId(Long livroDigitalId) {
        return count("livroDigital.id = ?1 and status = ?2 and flAtivo = true",
                livroDigitalId, FilaEsperaDigital.StatusFila.AGUARDANDO);
    }

    public Uni<FilaEsperaDigital> findPrimeiroNaFila(Long livroDigitalId) {
        return find("livroDigital.id = ?1 and status = ?2 and flAtivo = true order by posicaoFila",
                livroDigitalId, FilaEsperaDigital.StatusFila.AGUARDANDO).firstResult();
    }
}