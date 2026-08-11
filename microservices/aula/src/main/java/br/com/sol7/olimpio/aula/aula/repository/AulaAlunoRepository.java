package br.com.sol7.olimpio.aula.aula.repository;

import br.com.sol7.olimpio.aula.aula.entity.AulaAluno;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AulaAlunoRepository implements PanacheRepository<AulaAluno> {
}
