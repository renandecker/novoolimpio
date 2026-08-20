package br.com.sol7.olimpio.basico.auditoriahistorico.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.auditoriahistorico.entity.AuditoriaHistorico;

@ApplicationScoped
public class AuditoriaHistoricoRepository implements PanacheRepository<AuditoriaHistorico> {
}