package br.com.sol7.olimpio.estoque.controleentrega;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;

@Entity
@Table(name = "est_controle_entrega")
public class ControleEntrega extends PanacheEntity {

    @Column(name = "fl_ativo")
    public boolean ativo;
    @Column(name = "quantidade")
    public int quantidade;
    @Column(name = "status")
    public String status;
    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "dt_saida")
    public Date dataSaida;
    @Column(name = "codigo_rastreio")
    public String rastreio;
    @Column(name = "id_entrega")
    public Long entregaId;  // referencia a Entrega (id, cross-service)
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
}
