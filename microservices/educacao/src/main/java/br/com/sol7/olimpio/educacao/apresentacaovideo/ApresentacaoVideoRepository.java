package br.com.sol7.olimpio.educacao.apresentacaovideo;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ApresentacaoVideoRepository implements PanacheRepository<ApresentacaoVideo> {
}
