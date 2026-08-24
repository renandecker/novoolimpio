package br.com.sol7.olimpio.educacao.requisitomatriz;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RequisitoMatrizRepository implements PanacheRepository<RequisitoMatriz> {
}
