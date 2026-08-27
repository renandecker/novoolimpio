package br.com.sol7.olimpio.educacao.apresentacaovideo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_apresentacao_video")
public class ApresentacaoVideo extends PanacheEntity {

    @Column(name = "titulo")
    public String titulo;

    @Column(name = "local")
    public String local;
}
