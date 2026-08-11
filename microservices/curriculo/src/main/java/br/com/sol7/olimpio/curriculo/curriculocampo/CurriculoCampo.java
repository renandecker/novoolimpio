package br.com.sol7.olimpio.curriculo.curriculocampo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cur_curriculo_campo")
public class CurriculoCampo extends PanacheEntity {

    @Column(name = "id_campo")
    public Long campoId;

    @Column(name = "obrigatorio")
    public Boolean obrigatorio;

    @Column(name = "ordem")
    public Integer ordem;
}
