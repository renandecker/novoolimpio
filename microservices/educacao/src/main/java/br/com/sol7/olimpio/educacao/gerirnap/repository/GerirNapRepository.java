package br.com.sol7.olimpio.educacao.gerirnap;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GerirNapRepository implements PanacheRepository<GerirNap> {
}