package br.com.sol7.olimpio.comercial.controleprospecto;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="controle_prospecto") public class ControleProspecto extends PanacheEntity { public String nome; public String dadosJson; }