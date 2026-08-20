package br.com.sol7.olimpio.educacao.atividadecomplementar;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AtividadeComplementarRepository implements PanacheRepository<AtividadeComplementar> {
}