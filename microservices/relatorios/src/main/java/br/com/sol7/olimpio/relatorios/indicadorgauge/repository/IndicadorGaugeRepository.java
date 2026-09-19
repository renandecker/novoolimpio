package br.com.sol7.olimpio.relatorios.indicadorgauge.repository;

import br.com.sol7.olimpio.relatorios.indicadorgauge.entity.IndicadorGauge;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class IndicadorGaugeRepository implements PanacheRepository<IndicadorGauge> {
}