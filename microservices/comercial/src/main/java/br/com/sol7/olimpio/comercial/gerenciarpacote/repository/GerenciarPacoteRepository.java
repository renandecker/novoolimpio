package br.com.sol7.olimpio.comercial.gerenciarpacote;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GerenciarPacoteRepository implements PanacheRepository<GerenciarPacote> {
}