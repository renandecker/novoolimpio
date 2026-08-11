package br.com.sol7.olimpio.basico.comunicacaomensagem.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "bas_comunicacao_mensagem")
public class ComunicacaoMensagem extends PanacheEntity {

    @Column(name = "data")
    public Date data;
    @Column(name = "id_comunicacao")
    public Long comunicacaoId;  // referencia a Comunicacao (id, cross-service)
    @Column(name = "mensagem")
    public String mensagem;
}
