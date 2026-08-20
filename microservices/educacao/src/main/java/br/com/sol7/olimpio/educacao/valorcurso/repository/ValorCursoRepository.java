package br.com.sol7.olimpio.educacao.valorcurso;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class ValorCursoRepository implements PanacheRepository<ValorCurso> {

    // Migrado de ValorCursoRepository.buscarValoresComFormaPagamento (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.formasPagamento f where v = ?1 order by f.vezes
    public static final String SQL_BUSCAR_VALORES_COM_FORMA_PAGAMENTO =
            "SELECT v.* FROM edc_valor_curso v LEFT JOIN edc_valor_curso_forma_pagamento v_f_jt ON v_f_jt.id_valor_curso = v.id LEFT JOIN fin_forma_pagamento f ON f.id = v_f_jt.id_forma_pagamento WHERE v.id = ?1 ORDER BY f.qtd_vezes";

    public Uni<java.util.List<ValorCurso>> buscarValoresComFormaPagamento(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_FORMA_PAGAMENTO, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValoresComTaxas (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.taxas t where v = ?1  order by t.descricao
    public static final String SQL_BUSCAR_VALORES_COM_TAXAS =
            "SELECT v.* FROM edc_valor_curso v LEFT JOIN edc_valor_curso_taxa_curso v_t_jt ON v_t_jt.id_valor_curso = v.id LEFT JOIN edc_taxa_curso t ON t.id = v_t_jt.id_taxa_curso WHERE v.id = ?1 ORDER BY t.descricao";

    public Uni<java.util.List<ValorCurso>> buscarValoresComTaxas(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_TAXAS, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValoresComDesconto (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.desconto  d where v = ?1 order by d.descricao
    public static final String SQL_BUSCAR_VALORES_COM_DESCONTO =
            "SELECT v.* FROM edc_valor_curso v LEFT JOIN edc_valor_curso_desconto_curso v_d_jt ON v_d_jt.id_valor_curso = v.id LEFT JOIN edc_desconto_curso d ON d.id = v_d_jt.id_desconto_curso WHERE v.id = ?1 ORDER BY d.descricao";

    public Uni<java.util.List<ValorCurso>> buscarValoresComDesconto(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_DESCONTO, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValoresComRetencao (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.retencoes where v = ?1
    public static final String SQL_BUSCAR_VALORES_COM_RETENCAO =
            "SELECT v.* FROM edc_valor_curso v WHERE v.id = ?1";

    public Uni<java.util.List<ValorCurso>> buscarValoresComRetencao(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_RETENCAO, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValoresComUnidades (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.unidades u where u.ativo = true and v = ?1
    public static final String SQL_BUSCAR_VALORES_COM_UNIDADES =
            "SELECT v.* FROM edc_valor_curso v LEFT JOIN edc_valor_curso_unidade v_u_jt ON v_u_jt.id_valor_curso = v.id LEFT JOIN bas_unidade u ON u.id = v_u_jt.id_unidade WHERE u.fl_ativo = true and v.id = ?1";

    public Uni<java.util.List<ValorCurso>> buscarValoresComUnidades(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_UNIDADES, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValorCursoContrato (legado) - HQL original:
    // select v from Contrato c inner join c.valorCurso v where v = ?1
    public static final String SQL_BUSCAR_VALOR_CURSO_CONTRATO =
            "SELECT v.* FROM edc_contrato c INNER JOIN edc_valor_curso v ON v.id = c.id_valor_curso WHERE v.id = ?1";

    public Uni<java.util.List<ValorCurso>> buscarValorCursoContrato(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALOR_CURSO_CONTRATO, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValoresComFormaPagamentoAtivos (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.formasPagamento f where v = ?1 and f.ativo = true order by f.vezes
    public static final String SQL_BUSCAR_VALORES_COM_FORMA_PAGAMENTO_ATIVOS =
            "SELECT v.* FROM edc_valor_curso v LEFT JOIN edc_valor_curso_forma_pagamento v_f_jt ON v_f_jt.id_valor_curso = v.id LEFT JOIN fin_forma_pagamento f ON f.id = v_f_jt.id_forma_pagamento WHERE v.id = ?1 and f.ativo = true ORDER BY f.qtd_vezes";

    public Uni<java.util.List<ValorCurso>> buscarValoresComFormaPagamentoAtivos(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_FORMA_PAGAMENTO_ATIVOS, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValoresComTaxasAtivos (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.taxas t where v = ?1 and t.ativo = true order by t.descricao
    public static final String SQL_BUSCAR_VALORES_COM_TAXAS_ATIVOS =
            "SELECT v.* FROM edc_valor_curso v LEFT JOIN edc_valor_curso_taxa_curso v_t_jt ON v_t_jt.id_valor_curso = v.id LEFT JOIN edc_taxa_curso t ON t.id = v_t_jt.id_taxa_curso WHERE v.id = ?1 and t.ativo = true ORDER BY t.descricao";

    public Uni<java.util.List<ValorCurso>> buscarValoresComTaxasAtivos(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_TAXAS_ATIVOS, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarValoresComDescontoAtivos (legado) - HQL original:
    // select v from ValorCurso v left join fetch v.desconto d where v = ?1 and d.ativo = true order by d.descricao
    public static final String SQL_BUSCAR_VALORES_COM_DESCONTO_ATIVOS =
            "SELECT v.* FROM edc_valor_curso v LEFT JOIN edc_valor_curso_desconto_curso v_d_jt ON v_d_jt.id_valor_curso = v.id LEFT JOIN edc_desconto_curso d ON d.id = v_d_jt.id_desconto_curso WHERE v.id = ?1 and d.ativo = true ORDER BY d.descricao";

    public Uni<java.util.List<ValorCurso>> buscarValoresComDescontoAtivos(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_VALORES_COM_DESCONTO_ATIVOS, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }


    // Migrado de ValorCursoRepository.buscarexistenciaValorCursoContrato (legado) - HQL original:
    // select v from Contrato c inner join c.valorCurso v where v = ?1
    public static final String SQL_BUSCAREXISTENCIA_VALOR_CURSO_CONTRATO =
            "SELECT v.* FROM edc_contrato c INNER JOIN edc_valor_curso v ON v.id = c.id_valor_curso WHERE v.id = ?1 LIMIT 10";

    public Uni<java.util.List<ValorCurso>> buscarexistenciaValorCursoContrato(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAREXISTENCIA_VALOR_CURSO_CONTRATO, ValorCurso.class)
                        .setParameter(1, valorCursoId)
                        .getResultList());
    }

}