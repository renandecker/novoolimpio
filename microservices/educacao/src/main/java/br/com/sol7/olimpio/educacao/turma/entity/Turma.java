package br.com.sol7.olimpio.educacao.turma;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="turma") public class Turma extends PanacheEntity { public String nome; public String dadosJson; }