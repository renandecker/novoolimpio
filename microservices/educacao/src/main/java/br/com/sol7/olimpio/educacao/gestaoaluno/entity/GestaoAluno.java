package br.com.sol7.olimpio.educacao.gestaoaluno;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "gestao_aluno")
public class GestaoAluno extends PanacheEntity {
    public String nome;
    public String dadosJson;
}