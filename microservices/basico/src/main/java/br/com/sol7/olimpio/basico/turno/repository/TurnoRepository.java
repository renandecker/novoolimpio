package br.com.sol7.olimpio.basico.turno.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.turno.entity.Turno;

@ApplicationScoped
public class TurnoRepository implements PanacheRepository<Turno> {
}