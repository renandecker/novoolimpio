package br.com.sol7.olimpio.curriculo.empresaunidade;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.sql.Time;

@Entity
@Table(name = "cur_empresa_unidade")
public class EmpresaUnidade extends PanacheEntity {

    @Column(name = "id_empresa")
    public Long empresaId;

    @Column(name = "id_unidade")
    public Long unidadeId;

    @Column(name = "inicio")
    public Time inicio;

    @Column(name = "fim")
    public Time fim;

    @Column(name = "pre_autorizado")
    public Boolean preAutorizado;

    @Column(name = "id_tipo_contrato")
    public Long tipoContratoId;
}
