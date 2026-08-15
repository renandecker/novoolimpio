package br.com.sol7.olimpio.professor.aula.repository;

import br.com.sol7.olimpio.professor.aula.entity.AvaliacaoPerguntaAnexo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AvaliacaoPerguntaAnexoRepository implements PanacheRepository<AvaliacaoPerguntaAnexo> {
}
