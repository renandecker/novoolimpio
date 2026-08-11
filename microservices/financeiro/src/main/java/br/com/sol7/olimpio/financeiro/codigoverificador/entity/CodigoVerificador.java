package br.com.sol7.olimpio.financeiro.codigoverificador;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="codigo_verificador") public class CodigoVerificador extends PanacheEntity { public String nome; public String dadosJson; }