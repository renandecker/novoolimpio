package br.com.sol7.olimpio.curriculo.configuracao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ConfiguracaoRepository implements PanacheRepository<Configuracao> {
}
