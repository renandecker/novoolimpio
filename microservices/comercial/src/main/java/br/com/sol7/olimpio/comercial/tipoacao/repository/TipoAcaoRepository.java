package br.com.sol7.olimpio.comercial.tipoacao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TipoAcaoRepository implements PanacheRepository<TipoAcao> {
}