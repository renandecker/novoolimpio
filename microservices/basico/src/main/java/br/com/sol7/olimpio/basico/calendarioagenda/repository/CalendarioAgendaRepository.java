package br.com.sol7.olimpio.basico.calendarioagenda.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import br.com.sol7.olimpio.basico.calendarioagenda.entity.CalendarioAgenda;

@ApplicationScoped
public class CalendarioAgendaRepository implements PanacheRepository<CalendarioAgenda> {
}