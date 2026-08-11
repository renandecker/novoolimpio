package br.com.sol7.olimpio.basico.usuariologado.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.usuariologado.entity.UsuarioLogado;
@ApplicationScoped public class UsuarioLogadoRepository implements PanacheRepository<UsuarioLogado> {}