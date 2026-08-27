package br.com.sol7.olimpio.comercial.campanha;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.util.Date;

@Entity
@Table(name = "com_acao_de_campanha")
public class AcaoDeCampanha extends PanacheEntity {

    @Column(name = "data_inicial")
    public Date dataInicial;

    @Column(name = "data_final")
    public Date dataFinal;

    @Column(name = "id_tipo_canal")
    public Long tipoCanalId;

    @Column(name = "id_estrategia")
    public Long estrategiaId;
}
