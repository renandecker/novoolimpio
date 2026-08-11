package br.com.sol7.olimpio.relatorios.filtros;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class FiltrosRepository implements PanacheRepository<Filtros> {}