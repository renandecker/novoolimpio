package br.com.sol7.olimpio.curriculo.vaga;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "cur_vaga_unidade")
public class VagaUnidade extends PanacheEntity {

    @Column(name = "id_vaga")
    public Long vagaId;

    @Column(name = "id_unidade")
    public Long unidadeId;
}
