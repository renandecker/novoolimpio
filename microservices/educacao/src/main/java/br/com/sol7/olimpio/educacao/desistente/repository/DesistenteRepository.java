package br.com.sol7.olimpio.educacao.desistente;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class DesistenteRepository implements PanacheRepository<Desistente> {}