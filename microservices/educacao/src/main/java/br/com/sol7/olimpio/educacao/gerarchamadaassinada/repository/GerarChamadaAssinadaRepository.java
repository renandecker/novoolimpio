package br.com.sol7.olimpio.educacao.gerarchamadaassinada;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GerarChamadaAssinadaRepository implements PanacheRepository<GerarChamadaAssinada> {
}