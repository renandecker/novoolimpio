package br.com.sol7.olimpio.educacao.tipoatividade;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TipoAtividadeRepository implements PanacheRepository<TipoAtividade> {
}