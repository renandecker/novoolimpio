package br.com.sol7.olimpio.basico.tipounidade.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.tipounidade.entity.TipoUnidade;
@ApplicationScoped public class TipoUnidadeRepository implements PanacheRepository<TipoUnidade> {}