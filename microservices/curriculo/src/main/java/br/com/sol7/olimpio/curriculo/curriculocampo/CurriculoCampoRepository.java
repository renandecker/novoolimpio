package br.com.sol7.olimpio.curriculo.curriculocampo;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class CurriculoCampoRepository implements PanacheRepository<CurriculoCampo> {
}
