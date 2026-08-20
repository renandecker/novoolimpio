package br.com.sol7.olimpio.educacao.tipocontrato;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class TipoContratoRepository implements PanacheRepository<TipoContrato> {
}