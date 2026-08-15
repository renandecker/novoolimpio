package br.com.sol7.olimpio.educacao.unidade;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_unidade")
public class Unidade extends PanacheEntityBase {

    @Id
    public Long id;

    @Column(name = "razao_social")
    public String razaoSocial;

    @Column(name = "nome_fantasia")
    public String nomeFantasia;

    @Column(name = "sucinto")
    public String sucinto;
}
