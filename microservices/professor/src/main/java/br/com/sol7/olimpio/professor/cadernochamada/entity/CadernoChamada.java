package br.com.sol7.olimpio.professor.cadernochamada.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "caderno_chamada")
public class CadernoChamada extends PanacheEntity {
    public String nome;
    public String dadosJson;
}
