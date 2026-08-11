package br.com.sol7.olimpio.curriculo.empresaunidade;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class EmpresaUnidadeRepository implements PanacheRepository<EmpresaUnidade> {
}
