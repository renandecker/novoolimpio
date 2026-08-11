package br.com.sol7.olimpio.comercial.categoriacampo;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="categoria_campo") public class CategoriaCampo extends PanacheEntity { public String nome; public String dadosJson; }