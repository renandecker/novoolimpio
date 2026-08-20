package br.com.sol7.olimpio.basico.regiao.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.regiao.entity.Regiao;

@ApplicationScoped
public class RegiaoRepository implements PanacheRepository<Regiao> {
}