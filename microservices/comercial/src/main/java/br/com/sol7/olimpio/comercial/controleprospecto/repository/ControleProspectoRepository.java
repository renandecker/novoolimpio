package br.com.sol7.olimpio.comercial.controleprospecto;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ControleProspectoRepository implements PanacheRepository<ControleProspecto> {
}