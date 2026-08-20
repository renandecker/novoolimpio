package br.com.sol7.olimpio.central.ligacao;

import io.quarkus.hibernate.reactive.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;

import java.util.Date;

@Entity
@Table(name = "cen_ligacao")
public class Ligacao extends PanacheEntity {

    @Column(name = "id_usuario")
    public Long usuarioId;  // referencia a Usuario (id, cross-service)
    @Column(name = "data_inicial")
    public Date dataInicial;
    @Column(name = "data_final")
    public Date dataFinal;
    @Column(name = "relato")
    public String relato;
    @Column(name = "id_ordem_ligacao")
    public Long ordemLigacaoId;  // referencia a OrdemLigacao (id, cross-service)
    @Column(name = "id_resultado_contato")
    public Long resultadoContatoId;  // referencia a ResultadoContato (id, cross-service)
    @Column(name = "id_compromisso")
    public Long compromissoId;  // referencia a Compromisso (id, cross-service)
    @Column(name = "telefone_discado")
    public String telefoneDiscado;
    @Column(name = "id_curso_interesse")
    public Long cursoInteresseId;  // referencia a Curso (id, cross-service)
}
