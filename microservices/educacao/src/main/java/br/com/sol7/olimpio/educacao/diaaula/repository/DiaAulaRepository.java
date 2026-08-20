package br.com.sol7.olimpio.educacao.diaaula;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DiaAulaRepository implements PanacheRepository<DiaAula> {
}
