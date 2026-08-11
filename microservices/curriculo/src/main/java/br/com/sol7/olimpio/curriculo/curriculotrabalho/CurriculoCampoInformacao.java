package br.com.sol7.olimpio.curriculo.curriculotrabalho;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cur_curriculo_campo_informacao")
public class CurriculoCampoInformacao extends PanacheEntity {

    @Column(name = "id_curriculo_trabalho")
    public Long curriculoTrabalhoId;

    @Column(name = "id_campo")
    public Long campoId;

    @Column(name = "valor")
    public String valor;
}
