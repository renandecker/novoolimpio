package br.com.sol7.olimpio.educacao.turma;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
@ApplicationScoped public class TurmaRepository implements PanacheRepository<Turma> {}