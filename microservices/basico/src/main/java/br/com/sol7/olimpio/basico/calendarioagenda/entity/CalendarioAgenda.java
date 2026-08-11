package br.com.sol7.olimpio.basico.calendarioagenda.entity;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="calendario_agenda") public class CalendarioAgenda extends PanacheEntity { public String nome; public String dadosJson; }