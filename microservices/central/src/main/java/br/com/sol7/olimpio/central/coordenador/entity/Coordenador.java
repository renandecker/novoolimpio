package br.com.sol7.olimpio.central.coordenador;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "cen_coordenador")
public class Coordenador {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    public Long id;

    @Column(name = "id_operador")
    public Long operadorId;

    @Column(name = "id_coordenador")
    public Long coordenadorId;

    @Column(name = "data")
    @Temporal(TemporalType.DATE)
    public Date data;

    @Column(name = "ligacao")
    public Integer ligacao;

    @Column(name = "meta")
    public Integer meta;

    @Column(name = "agendado")
    public Integer agendado;

    @Column(name = "pausa")
    public Integer pausa;

    @Column(name = "prioritario")
    public Integer prioritario;
}
