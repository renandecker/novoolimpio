package br.com.sol7.olimpio.relatorios.comentario;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class ComentarioRepository implements PanacheRepository<Comentario> {}