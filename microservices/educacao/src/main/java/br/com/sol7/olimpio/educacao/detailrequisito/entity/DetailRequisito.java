package br.com.sol7.olimpio.educacao.detailrequisito;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "detail_requisito")
public class DetailRequisito extends PanacheEntity {
    public String nome;
    public String dadosJson;
}