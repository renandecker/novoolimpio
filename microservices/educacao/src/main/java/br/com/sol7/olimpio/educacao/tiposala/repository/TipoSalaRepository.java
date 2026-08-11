package br.com.sol7.olimpio.educacao.tiposala;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class TipoSalaRepository implements PanacheRepository<TipoSala> {}