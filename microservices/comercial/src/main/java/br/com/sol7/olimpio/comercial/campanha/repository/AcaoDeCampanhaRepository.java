package br.com.sol7.olimpio.comercial.campanha;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class AcaoDeCampanhaRepository implements PanacheRepository<AcaoDeCampanha> {}
