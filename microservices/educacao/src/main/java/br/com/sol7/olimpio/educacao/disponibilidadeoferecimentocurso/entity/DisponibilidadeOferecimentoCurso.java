package br.com.sol7.olimpio.educacao.disponibilidadeoferecimentocurso;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "disponibilidade_oferecimento_curso")
public class DisponibilidadeOferecimentoCurso extends PanacheEntity {
    public String nome;
    public String dadosJson;
}