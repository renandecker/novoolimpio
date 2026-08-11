package br.com.sol7.olimpio.financeiro.formapagamento;
import java.util.List;
import io.quarkus.hibernate.reactive.panache.PanacheRepository; import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
@ApplicationScoped public class FormaPagamentoRepository implements PanacheRepository<FormaPagamento> {

    // Migrado de FormaPagamentoService.verificarCotaAuto (legado) - SQL nativo original (3 updates)
    public static final String SQL_VERIFICAR_COTA_DIARIO =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
            "where taxa.cota = true and taxa.ativo = true and periodicidade = 'DIARIO' and taxa.data_controle_cota != current_date";
    public static final String SQL_VERIFICAR_COTA_SEMANAL =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
            "where taxa.cota = true and taxa.ativo = true and periodicidade = 'SEMANAL' " +
            "and (date_trunc('week', current_date) != date_trunc('week', taxa.data_controle_cota))";
    public static final String SQL_VERIFICAR_COTA_MENSAL =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
            "where taxa.cota = true and taxa.ativo = true and periodicidade = 'MENSAL' " +
            "and date_trunc('month', current_date) != date_trunc('month', taxa.data_controle_cota)";

    public Uni<Void> verificarCotaAutoNativo() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA_DIARIO).executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA_SEMANAL).executeUpdate())
                .chain(r -> io.quarkus.hibernate.reactive.panache.Panache.getSession())
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA_MENSAL).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de FormaPagamentoService.verificarCota (legado) - SQL nativo original:
    // UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota
    // where taxa.cota = true and taxa.ativo = true
    public static final String SQL_VERIFICAR_COTA =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
            "where taxa.cota = true and taxa.ativo = true";

    public Uni<Void> verificarCotaNativo() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA).executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de FormaPagamentoService.verificarCotaEntity (legado) - SQL nativo original:
    // UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota
    // from edc_valor_curso v inner join edc_valor_curso_forma_pagamento vd on (vd.id_valor_curso = v.id)
    // where taxa.id = vd.id_forma_pagamento and v.id = ?1 and taxa.cota = true and taxa.ativo = true
    public static final String SQL_VERIFICAR_COTA_ENTITY =
            "UPDATE fin_forma_pagamento taxa SET data_controle_cota = now(), valor_controle_cota = valor_cota " +
            "from edc_valor_curso v inner join edc_valor_curso_forma_pagamento vd on (vd.id_valor_curso = v.id) " +
            "where taxa.id = vd.id_forma_pagamento and v.id = ?1 and taxa.cota = true and taxa.ativo = true";

    public Uni<Void> verificarCotaEntityNativo(Long valorCursoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_VERIFICAR_COTA_ENTITY)
                    .setParameter(1, valorCursoId)
                    .executeUpdate())
                .replaceWithVoid();
    }

    // Migrado de FormaPagamentoRepository.autoComplete (legado) - HQL original:
    // select f from FormaPagamento f where (f.vezes) = ?1
    public static final String SQL_AUTO_COMPLETE =
            "SELECT f.* FROM fin_forma_pagamento f WHERE (f.qtd_vezes) = ?1";

    public Uni<java.util.List<FormaPagamento>> autoComplete(int s) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE, FormaPagamento.class)
                    .setParameter(1, s)
                    .getResultList());
    }


    // Migrado de FormaPagamentoRepository.buscaordemVezes (legado) - HQL original:
    // select f from FormaPagamento f order by f.vezes
    public static final String SQL_BUSCAORDEM_VEZES =
            "SELECT f.* FROM fin_forma_pagamento f ORDER BY f.qtd_vezes";

    public Uni<java.util.List<FormaPagamento>> buscaordemVezes() {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAORDEM_VEZES, FormaPagamento.class)

                    .getResultList());
    }

}