package br.com.sol7.olimpio.financeiro.caixa;

import java.util.Date;
import java.math.BigDecimal;
import java.util.List;

import br.com.sol7.olimpio.financeiro.caixa.entity.Caixa;
import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class CaixaRepository implements PanacheRepository<Caixa> {

    // Migrado de SchedulingService.fechamentoCaixaAbertos() (legado) - soma de entradas/saidas
    // (por tipo de movimento) e sangrias de um caixa, e fechamento propriamente dito.
    public static final String SQL_SOMAR_ENTRADAS =
            "SELECT COALESCE(SUM(m.valor), 0) FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = ?1 AND tm.id = 1";
    public static final String SQL_SOMAR_SAIDAS =
            "SELECT COALESCE(SUM(m.valor), 0) FROM fin_movimentacao m " +
                    "JOIN fin_movimento mv ON mv.id = m.id_movimento " +
                    "JOIN fin_tipo_movimento tm ON tm.id = mv.id_tipo_movimento " +
                    "WHERE m.id_caixa = ?1 AND tm.id = 2";
    public static final String SQL_SOMAR_SANGRIA =
            "SELECT COALESCE(SUM(valor), 0) FROM fin_sangria WHERE id_caixa = ?1";
    public static final String SQL_FECHAR_CAIXA =
            "UPDATE fin_caixa SET data_fechamento = now() WHERE id = ?1";

    private Uni<java.math.BigDecimal> somarNativo(String sql, Long caixaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(sql)
                        .setParameter(1, caixaId)
                        .getSingleResult())
                .map(v -> new java.math.BigDecimal(v.toString()));
    }

    public Uni<java.math.BigDecimal> somarEntradas(Long caixaId) {
        return somarNativo(SQL_SOMAR_ENTRADAS, caixaId);
    }

    public Uni<java.math.BigDecimal> somarSaidas(Long caixaId) {
        return somarNativo(SQL_SOMAR_SAIDAS, caixaId);
    }

    public Uni<java.math.BigDecimal> somarSangria(Long caixaId) {
        return somarNativo(SQL_SOMAR_SANGRIA, caixaId);
    }

    public Uni<Void> fecharCaixaNativo(Long caixaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_FECHAR_CAIXA).setParameter(1, caixaId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de CaixaController.abrirCaixa - remove data_fechamento
    public static final String SQL_ABRIR_CAIXA =
            "UPDATE fin_caixa SET data_fechamento = null WHERE id = ?1";

    public Uni<Void> abrirCaixaNativo(Long caixaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_ABRIR_CAIXA).setParameter(1, caixaId).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de CaixaRepository.buscarAberturaCaixa (legado) - HQL original:
    // select c from Caixa c where c.usuario = ?1 AND date(c.data) = current_date  order by c.id
    public static final String SQL_BUSCAR_ABERTURA_CAIXA =
            "SELECT c.* FROM fin_caixa c WHERE c.id_usuario = ?1 AND date(c.data) = current_date ORDER BY c.id";

    public Uni<java.util.List<Caixa>> buscarAberturaCaixa(Long usuarioId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_ABERTURA_CAIXA, Caixa.class)
                        .setParameter(1, usuarioId)
                        .getResultList());
    }


    // Migrado de CaixaRepository.buscarAberturaCaixaComUsuarioUnidade (legado) - HQL original:
    // select c from Caixa c where c.usuario = ?1 and c.unidade = ?2  AND date(c.data) = current_date
    public static final String SQL_BUSCAR_ABERTURA_CAIXA_COM_USUARIO_UNIDADE =
            "SELECT c.* FROM fin_caixa c WHERE c.id_usuario = ?1 and c.id_unidade = ?2 AND date(c.data) = current_date";

    public Uni<java.util.List<Caixa>> buscarAberturaCaixaComUsuarioUnidade(Long usuarioId, Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_ABERTURA_CAIXA_COM_USUARIO_UNIDADE, Caixa.class)
                        .setParameter(1, usuarioId)
                        .setParameter(2, unidadeId)
                        .getResultList());
    }


    // Migrado de CaixaRepository.buscarCaixasAbertos (legado) - HQL original:
    // select c from Caixa c where c.dataFechamento is null order by c.id
    public static final String SQL_BUSCAR_CAIXAS_ABERTOS =
            "SELECT c.* FROM fin_caixa c WHERE c.data_fechamento is null ORDER BY c.id";

    public Uni<java.util.List<Caixa>> buscarCaixasAbertos() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CAIXAS_ABERTOS, Caixa.class)

                        .getResultList());
    }


    // Migrado de CaixaRepository.countCaixaUnidade (legado) - HQL original:
    // select count(c) from Caixa c where c.unidade = ?1
    public static final String SQL_COUNT_CAIXA_UNIDADE =
            "SELECT count(c) FROM fin_caixa c WHERE c.id_unidade = ?1";

    public Uni<java.util.List<Object>> countCaixaUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_COUNT_CAIXA_UNIDADE)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }

}