package br.com.sol7.olimpio.central.coordenador;

import io.quarkus.hibernate.reactive.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CoordenadorRepository implements PanacheRepositoryBase<Coordenador, Long> {
}
