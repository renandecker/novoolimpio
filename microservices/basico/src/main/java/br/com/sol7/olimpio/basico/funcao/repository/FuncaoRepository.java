package br.com.sol7.olimpio.basico.funcao.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.funcao.entity.Funcao;
@ApplicationScoped public class FuncaoRepository implements PanacheRepository<Funcao> {}