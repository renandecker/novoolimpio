package br.com.sol7.olimpio.educacao.matrizcurricular;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class MatrizCurricularRepository implements PanacheRepository<MatrizCurricular> {
}
