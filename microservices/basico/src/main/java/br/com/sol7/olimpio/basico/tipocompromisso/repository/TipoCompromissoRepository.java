package br.com.sol7.olimpio.basico.tipocompromisso.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.tipocompromisso.entity.TipoCompromisso;
@ApplicationScoped public class TipoCompromissoRepository implements PanacheRepository<TipoCompromisso> {}