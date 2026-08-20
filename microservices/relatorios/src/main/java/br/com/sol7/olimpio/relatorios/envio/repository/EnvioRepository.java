package br.com.sol7.olimpio.relatorios.envio;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class EnvioRepository implements PanacheRepository<Envio> {
}