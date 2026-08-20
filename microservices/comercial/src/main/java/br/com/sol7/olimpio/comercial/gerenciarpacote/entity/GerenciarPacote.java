package br.com.sol7.olimpio.comercial.gerenciarpacote;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "gerenciar_pacote")
public class GerenciarPacote extends PanacheEntity {
    public String nome;
    public String dadosJson;
}