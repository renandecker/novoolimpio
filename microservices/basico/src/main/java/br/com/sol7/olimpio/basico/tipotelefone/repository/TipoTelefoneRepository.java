package br.com.sol7.olimpio.basico.tipotelefone.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.tipotelefone.entity.TipoTelefone;

@ApplicationScoped
public class TipoTelefoneRepository implements PanacheRepository<TipoTelefone> {
}