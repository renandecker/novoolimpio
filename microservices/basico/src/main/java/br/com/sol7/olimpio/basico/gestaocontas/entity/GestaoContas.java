package br.com.sol7.olimpio.basico.gestaocontas.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "gestao_contas")
public class GestaoContas extends PanacheEntity {
    public String nome;
    public String dadosJson;
}