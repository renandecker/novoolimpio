package br.com.sol7.olimpio.relatorios.mapa;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "rel_mapa_regra")
public class MapaRegra extends PanacheEntity {

    @Column(name = "descricao", columnDefinition = "text")
    public String descricao;

    @Column(name = "cor", columnDefinition = "text")
    public String cor;

    @Column(name = "meta", precision = 10, scale = 2)
    public BigDecimal meta;

    @Column(name = "meta_dois", precision = 10, scale = 2)
    public BigDecimal meta2;

    @Column(name = "marker_tamanho")
    public Integer markerTamanho = 10;

    @Column(name = "condicao", columnDefinition = "text")
    public String condicao;

    @Column(name = "ativo")
    public Boolean ativo = false;

    @Column(name = "id_medida")
    public Long medidaId;

    @Column(name = "id_medida_meta")
    public Long medidaMetaId;

    @Column(name = "id_medida_meta_dois")
    public Long medidaMetaDoisId;

    @Column(name = "id_cores")
    public Long coresId;

    @Column(name = "id_mapa")
    public Long mapaId;
}