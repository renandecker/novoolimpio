package br.com.sol7.olimpio.educacao.gestaoaluno;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class GestaoAlunoRepository implements PanacheRepository<GestaoAluno> {}