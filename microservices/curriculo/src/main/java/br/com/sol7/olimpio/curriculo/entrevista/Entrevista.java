package br.com.sol7.olimpio.curriculo.entrevista;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "cur_entrevista_vaga_empresa")
public class Entrevista extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;

    @Column(name = "id_vaga")
    public Long vagaId;

    @Column(name = "id_empresa")
    public Long empresaId;

    @Column(name = "token")
    public String token;

    @Column(name = "fl_email_enviado_aluno")
    public Boolean flEmailEnviadoAluno;

    @Column(name = "fl_email_enviado_empresa")
    public Boolean flEmailEnviadoEmpresa;

    @Column(name = "fl_resposta")
    public Boolean flResposta;

    @Column(name = "data_final")
    public Date dataFinal;

    @Column(name = "data_aceite_aluno")
    public Date dataAceiteAluno;
}
