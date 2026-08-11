package br.com.sol7.olimpio.curriculo.vaga;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class VagaEmpresaRepository implements PanacheRepository<VagaEmpresa> {
}
