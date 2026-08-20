package br.com.sol7.olimpio.comercial.arquivoprocon;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "com_arquivos_procon")
public class ArquivoProcon extends PanacheEntity {

    @Column(name = "data")
    public Date data;
    @Column(name = "numero_linhas")
    public Integer numeroLinhas;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "hash")
    public String hash;
    @Column(name = "prospectos_deletados_pacote")
    public Integer prospectosDeletadosPacote;
}
