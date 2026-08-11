package br.com.sol7.olimpio.aula.avaliacao.repository;

import br.com.sol7.olimpio.aula.avaliacao.entity.AvaliacaoPerguntaAnexo;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AvaliacaoPerguntaAnexoRepository implements PanacheRepository<AvaliacaoPerguntaAnexo> {
}
