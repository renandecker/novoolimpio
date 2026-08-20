package br.com.sol7.olimpio.pagamento.cartaopessoa.entity;

import io.quarkus.hibernate.reactive.panache.PanacheEntityBase;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.SequenceGenerator;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

/**
 * Cartao cadastrado por uma pessoa (bas_pessoa). Guarda apenas bin + ultimos digitos + cpf +
 * o payment_token retornado pela Fiserv - NUNCA o PAN completo ou o CVV (PCI-DSS).
 */
@Entity
@Table(name = "fin_cartao_pessoa")
public class CartaoPessoa extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "fin_cartao_pessoa_seq")
    @SequenceGenerator(name = "fin_cartao_pessoa_seq", sequenceName = "fin_cartao_pessoa_id_seq", allocationSize = 1)
    public Long id;

    @Column(name = "id_pessoa", nullable = false)
    public Long idPessoa;

    @Column(name = "cpf", nullable = false)
    public String cpf;

    @Column(name = "bin", nullable = false)
    public String bin;

    @Column(name = "ultimos_digitos", nullable = false)
    public String ultimosDigitos;

    @Column(name = "bandeira")
    public String bandeira;

    @Column(name = "nome_titular")
    public String nomeTitular;

    @Column(name = "validade_mes")
    public String validadeMes;

    @Column(name = "validade_ano")
    public String validadeAno;

    @Column(name = "payment_token")
    public String paymentToken;

    @Column(name = "fiserv_token_id")
    public String fiservTokenId;

    @Column(name = "apelido")
    public String apelido;

    @Column(name = "fl_ativo")
    public boolean ativo = true;

    @Column(name = "fl_principal")
    public boolean principal = false;

    @Column(name = "data_cadastro")
    public LocalDateTime dataCadastro = LocalDateTime.now();

    @Column(name = "data_alteracao")
    public LocalDateTime dataAlteracao;

    @Column(name = "id_usuario_cadastro")
    public Long idUsuarioCadastro;
}
