package br.com.sol7.olimpio.relatorios.comentario;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "rel_comentario")
public class Comentario extends PanacheEntity {

    @Column(name = "assunto")
    public String assunto;
    @Column(name = "id_comentario")
    public Long comentarioId;  // referencia a Comentario (id, cross-service)
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "data_atualizacao")
    public Date dataAtualizacao;
}
