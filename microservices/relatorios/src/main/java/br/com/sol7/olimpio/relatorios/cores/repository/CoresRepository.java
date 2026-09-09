package br.com.sol7.olimpio.relatorios.cores.repository;
import br.com.sol7.olimpio.relatorios.cores.entity.Cores;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CoresRepository implements PanacheRepository<Cores> {
}