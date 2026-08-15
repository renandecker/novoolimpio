package br.com.sol7.olimpio.professor.aula.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_aula_anexo")
public class AulaAnexo extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(name = "id_aula")
    public Long aulaId;
    @Column(name = "nome")
    public String nome;
    @Column(name = "anexo", columnDefinition = "text")
    public String anexo;
    @Column(name = "tipo", length = 100)
    public String tipo;
}
