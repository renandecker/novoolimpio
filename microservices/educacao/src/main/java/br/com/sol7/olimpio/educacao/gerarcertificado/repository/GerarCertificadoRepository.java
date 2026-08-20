package br.com.sol7.olimpio.educacao.gerarcertificado;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class GerarCertificadoRepository implements PanacheRepository<GerarCertificado> {
}