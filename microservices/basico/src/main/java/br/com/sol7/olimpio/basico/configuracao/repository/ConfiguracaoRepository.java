package br.com.sol7.olimpio.basico.configuracao.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.configuracao.entity.Configuracao;

@ApplicationScoped
public class ConfiguracaoRepository implements PanacheRepository<Configuracao> {
}