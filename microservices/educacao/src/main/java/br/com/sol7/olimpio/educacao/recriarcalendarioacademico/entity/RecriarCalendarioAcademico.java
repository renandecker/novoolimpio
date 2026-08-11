package br.com.sol7.olimpio.educacao.recriarcalendarioacademico;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="recriar_calendario_academico") public class RecriarCalendarioAcademico extends PanacheEntity { public String nome; public String dadosJson; }