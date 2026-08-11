package br.com.sol7.olimpio.educacao.etapasnap;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "edc_etapas_nap")
public class EtapasNAP extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "fl_usuario")
    public boolean usuario;
    @Column(name = "fl_perfil")
    public boolean perfil;
    @Column(name = "campo_customizado", columnDefinition = "text")
    public String campoCustomizado;
    @Column(name = "tipo_modelo_documento")
    public int tipoModeloDocumento;
    @Column(name = "local_documento")
    public String localDocumento;
    @Column(name = "nome_documento")
    public String nomeDocumento;
    @Column(name = "campo_detalhes")
    public String campoDetalhes;
    @Column(name = "fl_customizado")
    public boolean customizado;
    @Column(name = "ordem")
    public Integer ordem;
}
