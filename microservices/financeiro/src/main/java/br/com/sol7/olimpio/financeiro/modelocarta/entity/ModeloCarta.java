package br.com.sol7.olimpio.financeiro.modelocarta;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "fin_modelo_carta")
public class ModeloCarta extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "local_documento")
    public String localDocumento;
}
