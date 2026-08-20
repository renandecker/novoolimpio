package br.com.sol7.olimpio.relatorios.relatorio;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class RelatorioRepository implements PanacheRepository<Relatorio> {
}