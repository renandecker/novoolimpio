package br.com.sol7.olimpio.basico.feriado.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.*;

import java.util.List;

@Entity
@Table(name = "bas_feriado_ajuste")
public class FeriadoAjuste extends PanacheEntity {

    @Column(name = "id_feriado")
    public Long feriadoId;

    @Column(name = "id_usuario")
    public Long usuarioId;

    @Column(name = "fl_ativo")
    public Boolean ativo = true;

    @Column(name = "fl_ocorrencia")
    public Boolean ocorrencia = false;

    @ElementCollection
    @CollectionTable(name = "bas_feriado_ocorrencia_ajustar", joinColumns = @JoinColumn(name = "id_feriado_ajuste"))
    @Column(name = "id_ocorrencia_componente_curricular")
    public List<Long> ocorrenciaAjustarIds;

    @ElementCollection
    @CollectionTable(name = "bas_feriado_ocorrencia_nao_ajustar", joinColumns = @JoinColumn(name = "id_feriado_ajuste"))
    @Column(name = "id_ocorrencia_componente_curricular")
    public List<Long> ocorrenciaNaoAjustarIds;
}