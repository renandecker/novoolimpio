package br.com.sol7.olimpio.central.meta;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "cen_meta")
public class Meta extends PanacheEntity {

    @Column(name = "id_operador")
    public Long operadorId;  // referencia a Usuario (id, cross-service)
    @Column(name = "meta")
    public Integer meta;
    @Column(name = "data")
    public Date data;
    @Column(name = "data_inicial")
    public Date dataInicial;
    @Column(name = "data_final")
    public Date dataFinal;
    @Column(name = "id_operacional")
    public Long operacionalId;  // referencia a Operacional (id, cross-service)
    @Column(name = "id_usuario_lancou_media")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
}
