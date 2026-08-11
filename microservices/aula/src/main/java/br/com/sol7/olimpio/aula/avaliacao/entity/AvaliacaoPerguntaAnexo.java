package br.com.sol7.olimpio.aula.avaliacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_avaliacao_pergunta_anexo")
public class AvaliacaoPerguntaAnexo extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;
    @Column(name = "id_avaliacao_pergunta")
    public Long avaliacaoPerguntaId;
    @Column(name = "nome")
    public String nome;
    @Column(name = "anexo", columnDefinition = "text")
    public String anexo;
}
