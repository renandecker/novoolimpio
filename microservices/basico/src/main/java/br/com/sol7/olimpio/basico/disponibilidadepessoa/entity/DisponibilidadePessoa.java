package br.com.sol7.olimpio.basico.disponibilidadepessoa.entity;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="disponibilidade_pessoa") public class DisponibilidadePessoa extends PanacheEntity { public String nome; public String dadosJson; }