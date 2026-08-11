package br.com.sol7.olimpio.aula.aula.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "edc_aula_aluno")
@IdClass(AulaAlunoId.class)
public class AulaAluno {

    @Id
    @Column(name = "id_aula")
    public Long aulaId;

    @Id
    @Column(name = "id_pessoa")
    public Long pessoaId;

    @Column(name = "data_assitida")
    public Date dataAssistida;
}
