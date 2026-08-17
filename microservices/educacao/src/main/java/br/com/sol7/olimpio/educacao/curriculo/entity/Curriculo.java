package br.com.sol7.olimpio.educacao.curriculo;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;
import java.util.Date;

@Entity
@Table(name = "edc_curriculo")
public class Curriculo extends PanacheEntity {

    @Column(name = "id_curso")
    public Long cursoId;  // referencia a Curso (id, cross-service)
    @Column(name = "descricao")
    public String descricao;
    @Column(name = "id_tipo_curso")
    public Long tipoCursoId;  // referencia a TipoCurso (id, cross-service)
    @Column(name = "sucinto")
    public String sucinto;
    @Column(name = "descricao_diploma")
    public String descricaoDiploma;
    @Column(name = "sigla")
    public String sigla;
    @Column(name = "carga_horaria")
    public Integer cargaHoraria;
    @Column(name = "qtde_iniciando")
    public int qtdeIniciando;
    @Column(name = "qtde_finalizando")
    public int qtdeFinalizando;
    @Column(name = "numero_parecer")
    public String numeroParecer;
    @Column(name = "licenca")
    public String licenca;
    @Column(name = "reconhecimento")
    public String reconhecimento;
    @Column(name = "qtd_maxima_alunos")
    public int qtdMaximaAlunos;
    @Column(name = "tipo_modelo_contrato")
    public int tipoModeloContrato;
    @Column(name = "tipo_modelo_boletim")
    public int tipoModeloBoletim;
    @Column(name = "tipo_modelo_certificado")
    public int tipoModeloCertificado;
    @Column(name = "tipo_modelo_promissoria")
    public int tipoModeloPromissoria;
    @Column(name = "id_escolaridade")
    public Long escolaridadeId;  // referencia a Escolaridade (id, cross-service)
    @Column(name = "idade_minima")
    public Integer idadeMinima;
    @Column(name = "idade_maxima")
    public Integer idadeMaxima;
    @Column(name = "data_cancelamento")
    @Temporal(TemporalType.DATE)
    public Date dataCancelamento;
    @Column(name = "template_contrato")
    public String templateContrato;
    @Column(name = "template_certificado")
    public String templateCertificado;
    @Column(name = "template_boletim")
    public String templateBoletim;
    @Column(name = "template_promissoria")
    public String templatePromissoria;
    @Column(name = "id_grau")
    public Long grauId;  // referencia a Grau (id, cross-service)
    @Column(name = "possui_rematricula")
    public Boolean possuiRematricula;
}
