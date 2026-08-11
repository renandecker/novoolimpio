package br.com.sol7.olimpio.educacao.gerarchamadaassinada;
import io.quarkus.hibernate.reactive.panache.PanacheEntity; import jakarta.persistence.Entity; import jakarta.persistence.Table;
@Entity @Table(name="gerar_chamada_assinada") public class GerarChamadaAssinada extends PanacheEntity { public String nome; public String dadosJson; }