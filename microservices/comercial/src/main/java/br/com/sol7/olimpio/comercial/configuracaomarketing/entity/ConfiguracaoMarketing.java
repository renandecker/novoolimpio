package br.com.sol7.olimpio.comercial.configuracaomarketing;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.math.BigDecimal;

@Entity
@Table(name = "cen_configuracao_marketing")
public class ConfiguracaoMarketing extends PanacheEntity {

    @Column(name = "prospecto_bloqueio_salvar")
    public BigDecimal notaMaximaBloquear;
    @Column(name = "prospecto_confirmar_salvar")
    public BigDecimal notaMaximaConfirmar;
    @Column(name = "tempo_maximo_ligacao")
    public Integer tempoMaximoLigacao;
    @Column(name = "dias_atulizar_procon")
    public Integer diasArquivoProcon;
    @Column(name = "tempo_maximo_intervalo")
    public Integer tempoMaximoIntervalo;
    @Column(name = "limite_maximo_radar")
    public Integer limiteMaximoRadar;
    @Column(name = "id_resultado_tempo_maximo")
    public Long resultadoContatoExpiradoId;  // referencia a ResultadoContato (id, cross-service)
    @Column(name = "id_resultado_retorno")
    public Long resultadoContatoRetornoId;  // referencia a ResultadoContato (id, cross-service)
}
