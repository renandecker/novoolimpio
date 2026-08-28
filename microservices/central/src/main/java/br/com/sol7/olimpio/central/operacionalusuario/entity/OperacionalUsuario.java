package br.com.sol7.olimpio.central.operacionalusuario;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "cen_operacional_usuario")
public class OperacionalUsuario extends PanacheEntityBase {

    @Id
    @Column(name = "id")
    public Long id;

    @Column(name = "id_operacional")
    public Long operacionalId;

    @Column(name = "id_usuario")
    public Long usuarioId;

    @Column(name = "status")
    public String status;

    @Column(name = "meta")
    public Integer meta;

    @Column(name = "ligacao")
    public Integer ligacao;

    @Column(name = "agendado")
    public Integer agendado;

    @Column(name = "pausa")
    public Integer pausa;

    @Column(name = "prioritario")
    public Integer prioritario;
}