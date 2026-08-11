package br.com.sol7.olimpio.educacao.historicoaluno;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "edc_historico_aluno")
public class HistoricoAluno extends PanacheEntity {

    @Column(name = "descricao", columnDefinition = "text")
    public String descricao;
    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "id_aluno")
    public Long alunoId;  // referencia a Pessoa (id, cross-service)
    @Column(name = "data_registro")
    public Date dataRegistro;
}
