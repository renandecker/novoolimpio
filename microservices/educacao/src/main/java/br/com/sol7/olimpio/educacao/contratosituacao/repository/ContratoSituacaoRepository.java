package br.com.sol7.olimpio.educacao.contratosituacao;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ContratoSituacaoRepository implements PanacheRepository<ContratoSituacao> {
}