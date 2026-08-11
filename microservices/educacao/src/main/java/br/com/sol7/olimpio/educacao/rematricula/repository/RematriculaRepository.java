package br.com.sol7.olimpio.educacao.rematricula;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class RematriculaRepository implements PanacheRepository<Rematricula> {}