package br.com.sol7.olimpio.comercial.prospectoradar;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class ProspectoRadarRepository implements PanacheRepository<ProspectoRadar> {
}