package br.com.sol7.olimpio.comercial.gerarpacote;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GerarPacoteRepository implements PanacheRepository<GerarPacote> {
}