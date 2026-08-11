package br.com.sol7.olimpio.educacao.grau;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "edc_grau")
public class Grau extends PanacheEntity {

    @Column(name = "descricao")
    public String descricao;
    @Column(name = "tipo_grau")
    public String tipoGrau;
    @Column(name = "frequencia_minima")
    public BigDecimal frequenciaMinima;
    @Column(name = "media_sem_exame")
    public BigDecimal mediaSemExame;
    @Column(name = "media_final")
    public BigDecimal mediaFinal;
    @Column(name = "nota_maxima")
    public BigDecimal notaMaxima;
    @Column(name = "conceito_sem_exame")
    public Integer conceitoSemExame;  // FK para edc_grau_conceito(id)
    @Column(name = "conceito_final")
    public Integer conceitoFinal;  // FK para edc_grau_conceito(id)
    @Column(name = "cancelado")
    public boolean cancelado;
    @Column(name = "limite_manual")
    public boolean limiteManual;
    @Column(name = "limite_manual_aluno")
    public boolean limiteManualAluno;
    @Column(name = "recuperacao")
    public boolean recuperacao;
    @Column(name = "manual")
    public boolean manual;
    @Column(name = "manual_aluno")
    public boolean manualAluno;
    @Column(name = "peso_distinto")
    public boolean pesoDistinto;
    @Column(name = "notas_parciais")
    public int notasParciais;
}
