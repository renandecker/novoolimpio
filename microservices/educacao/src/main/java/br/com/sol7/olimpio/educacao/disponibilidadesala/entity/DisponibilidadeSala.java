package br.com.sol7.olimpio.educacao.disponibilidadesala;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="disponibilidade_sala") public class DisponibilidadeSala extends PanacheEntity { public String nome; public String dadosJson; }