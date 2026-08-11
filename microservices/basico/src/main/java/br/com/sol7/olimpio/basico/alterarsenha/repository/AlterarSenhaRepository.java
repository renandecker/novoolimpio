package br.com.sol7.olimpio.basico.alterarsenha.repository;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.alterarsenha.entity.AlterarSenha;
@ApplicationScoped public class AlterarSenhaRepository implements PanacheRepository<AlterarSenha> {}