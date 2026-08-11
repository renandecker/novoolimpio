package br.com.sol7.olimpio.central.coordenador;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class CoordenadorRepository implements PanacheRepository<Coordenador> {}