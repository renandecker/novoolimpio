package br.com.sol7.olimpio.basico.alterarsenha.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "alterar_senha")
public class AlterarSenha extends PanacheEntity {
    public String nome;
    public String dadosJson;
}