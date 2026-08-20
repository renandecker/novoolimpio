package br.com.sol7.olimpio.financeiro.modelocarta;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ModeloCartaRepository implements PanacheRepository<ModeloCarta> {
}