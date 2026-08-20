package br.com.sol7.olimpio.comercial.atendimentoconsultor;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "atendimento_consultor")
public class AtendimentoConsultor extends PanacheEntity {
    public String nome;
    public String dadosJson;
}