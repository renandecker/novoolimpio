package br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.repository;

import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.entity.CurriculoAtividadeComplementar;
import br.com.sol7.olimpio.educacao.curriculoatividadecomplementar.entity.CurriculoAtividadeComplementarId;
import io.quarkus.hibernate.reactive.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CurriculoAtividadeComplementarRepository implements PanacheRepositoryBase<CurriculoAtividadeComplementar, CurriculoAtividadeComplementarId> {
}
