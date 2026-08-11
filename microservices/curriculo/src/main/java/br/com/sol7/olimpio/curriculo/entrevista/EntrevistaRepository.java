package br.com.sol7.olimpio.curriculo.entrevista;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class EntrevistaRepository implements PanacheRepository<Entrevista> {
}
