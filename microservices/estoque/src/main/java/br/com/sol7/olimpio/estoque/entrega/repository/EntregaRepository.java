package br.com.sol7.olimpio.estoque.entrega;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class EntregaRepository implements PanacheRepository<Entrega> {}