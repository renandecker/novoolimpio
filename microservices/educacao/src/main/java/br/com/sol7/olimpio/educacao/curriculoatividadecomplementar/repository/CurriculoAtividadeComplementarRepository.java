package br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.repository;

import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.entity.CurriculoAtividadeComplementar;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CurriculoAtividadeComplementarRepository implements PanacheRepository<CurriculoAtividadeComplementar> {
}
