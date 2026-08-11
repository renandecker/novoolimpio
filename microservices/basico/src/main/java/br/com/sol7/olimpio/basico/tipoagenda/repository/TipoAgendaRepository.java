package br.com.sol7.olimpio.basico.tipoagenda.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.tipoagenda.entity.TipoAgenda;
@ApplicationScoped public class TipoAgendaRepository implements PanacheRepository<TipoAgenda> {}