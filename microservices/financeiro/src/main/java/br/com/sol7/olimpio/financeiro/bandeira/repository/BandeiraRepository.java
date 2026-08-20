package br.com.sol7.olimpio.financeiro.bandeira;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class BandeiraRepository implements PanacheRepository<Bandeira> {
}