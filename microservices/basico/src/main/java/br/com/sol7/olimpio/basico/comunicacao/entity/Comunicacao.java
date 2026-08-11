package br.com.sol7.olimpio.basico.comunicacao.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "bas_comunicacao")
public class Comunicacao extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "titulo")
    public String titulo;
    @Column(name = "mensagem")
    public String mensagem;
    @Column(name = "data")
    public Date data;
}
