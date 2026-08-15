package br.com.sol7.olimpio.educacao.unidade;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UnidadeRepository implements PanacheRepository<Unidade> {
}
