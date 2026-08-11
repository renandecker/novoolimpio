package br.com.sol7.olimpio.curriculo.empresa;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class EmpresaRepository implements PanacheRepository<Empresa> {
}
