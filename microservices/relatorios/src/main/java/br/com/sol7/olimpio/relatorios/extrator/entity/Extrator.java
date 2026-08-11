package br.com.sol7.olimpio.relatorios.extrator;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "rel_extrator")
public class Extrator extends PanacheEntity {

    @Column(name = "log")
    public String log;
    @Column(name = "situacao")
    public String situacao;
    @Column(name = "tipo")
    public String tipo;
    @Column(name = "sql", columnDefinition = "text")
    public String sql;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_tabela")
    public Long tabelaId;  // referencia a Tabela (id, cross-service)
    @Column(name = "data_inicio")
    public Date dataInicio;
    @Column(name = "data_fim")
    public Date dataFim;
}
