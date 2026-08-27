package br.com.sol7.olimpio.central.tipopausa;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Entity
@Table(name = "cen_tipo_pausa")
public class TipoPausa extends PanacheEntity {

    @NotBlank
    @Size(min = 3, max = 255)
    @Column(name = "descricao", nullable = false, length = 255)
    public String descricao;

    @NotNull
    @Column(name = "qtde_tempo", nullable = false)
    public Integer tempo;
}
