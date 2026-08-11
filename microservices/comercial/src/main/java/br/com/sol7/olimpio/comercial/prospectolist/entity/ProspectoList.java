package br.com.sol7.olimpio.comercial.prospectolist;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="prospecto_list") public class ProspectoList extends PanacheEntity { public String nome; public String dadosJson; }