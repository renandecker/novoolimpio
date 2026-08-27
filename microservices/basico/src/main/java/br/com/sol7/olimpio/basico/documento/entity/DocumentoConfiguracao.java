package br.com.sol7.olimpio.basico.documento.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "documento_configuracao")
public class DocumentoConfiguracao extends PanacheEntity {
    public String nome;
    public String descricao;
    public String tipoRelatorio;
    public String arquivoModelo;
    public boolean ativo;
}