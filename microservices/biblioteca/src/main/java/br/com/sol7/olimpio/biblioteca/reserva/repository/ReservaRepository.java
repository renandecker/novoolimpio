package br.com.sol7.olimpio.biblioteca.reserva.repository;

import br.com.sol7.olimpio.biblioteca.reserva.entity.Reserva;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;

@ApplicationScoped
public class ReservaRepository implements PanacheRepository<Reserva> {

    public Uni<List<Reserva>> findByUsuarioId(Long usuarioId) {
        return list("usuarioId = ?1 and flAtivo = true order by dataSolicitacao", usuarioId);
    }

    public Uni<List<Reserva>> findByObraId(Long obraId) {
        return list("obra.id = ?1 and flAtivo = true order by posicaoFila", obraId);
    }

    public Uni<List<Reserva>> findByStatus(Reserva.StatusReserva status) {
        return list("status = ?1 and flAtivo = true", status);
    }

    public Uni<Long> countAguardandoByObraId(Long obraId) {
        return count("obra.id = ?1 and status = ?2 and flAtivo = true", obraId, Reserva.StatusReserva.AGUARDANDO_FILA);
    }

    public Uni<Reserva> findPrimeiraNaFila(Long obraId) {
        return find("obra.id = ?1 and status = ?2 and flAtivo = true order by posicaoFila", obraId, Reserva.StatusReserva.AGUARDANDO_FILA).firstResult();
    }
}