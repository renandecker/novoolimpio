package br.com.sol7.olimpio.central.tipopausa;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class TipoPausaRepository implements PanacheRepository<TipoPausa> {}