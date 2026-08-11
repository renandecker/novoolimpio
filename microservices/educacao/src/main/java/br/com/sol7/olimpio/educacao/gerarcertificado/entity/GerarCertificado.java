package br.com.sol7.olimpio.educacao.gerarcertificado;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="gerar_certificado") public class GerarCertificado extends PanacheEntity { public String nome; public String dadosJson; }