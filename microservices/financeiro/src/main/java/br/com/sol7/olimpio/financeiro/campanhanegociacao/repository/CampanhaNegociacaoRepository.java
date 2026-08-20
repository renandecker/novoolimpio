package br.com.sol7.olimpio.financeiro.campanhanegociacao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CampanhaNegociacaoRepository implements PanacheRepository<CampanhaNegociacao> {
}