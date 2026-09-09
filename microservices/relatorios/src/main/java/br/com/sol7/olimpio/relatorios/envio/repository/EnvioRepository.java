package br.com.sol7.olimpio.relatorios.envio.repository;
import br.com.sol7.olimpio.relatorios.envio.entity.Envio;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class EnvioRepository implements PanacheRepository<Envio> {
}