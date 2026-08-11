package br.com.sol7.olimpio.comercial.tipocanal;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class TipoCanalRepository implements PanacheRepository<TipoCanal> {}