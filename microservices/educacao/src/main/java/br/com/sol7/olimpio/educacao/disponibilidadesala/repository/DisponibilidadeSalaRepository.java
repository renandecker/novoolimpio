package br.com.sol7.olimpio.educacao.disponibilidadesala;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DisponibilidadeSalaRepository implements PanacheRepository<DisponibilidadeSala> {
}