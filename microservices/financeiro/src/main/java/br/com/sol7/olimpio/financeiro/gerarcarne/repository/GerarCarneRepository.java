package br.com.sol7.olimpio.financeiro.gerarcarne;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class GerarCarneRepository implements PanacheRepository<GerarCarne> {}