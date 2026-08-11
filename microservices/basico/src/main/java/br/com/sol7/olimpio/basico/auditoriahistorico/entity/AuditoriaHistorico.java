package br.com.sol7.olimpio.basico.auditoriahistorico.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

@Entity
@Table(name = "bas_auditoria_historico")
public class AuditoriaHistorico extends PanacheEntity {

    @Column(name = "nome")
    public String nome;
    @Column(name = "sql")
    public String sql;
    @Column(name = "sql_data")
    public String sqlData;
    @Column(name = "sql_tipo")
    public String sqlTipo;
    @Column(name = "sql_unidade")
    public String sqlUnidade;
    @Column(name = "sql_usuario")
    public String sqlUsuario;
}
