package br.com.sol7.olimpio.professor.disponibilidade.repository;

import br.com.sol7.olimpio.professor.disponibilidade.entity.DisponibilidadeProfessor;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class DisponibilidadeProfessorRepository implements PanacheRepository<DisponibilidadeProfessor> {
}
