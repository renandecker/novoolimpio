package br.com.sol7.olimpio.basico.gestaocontas.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;
import br.com.sol7.olimpio.basico.gestaocontas.entity.GestaoContas;

@ApplicationScoped
public class GestaoContasRepository implements PanacheRepository<GestaoContas> {

    // Migrado de GestaoContasController.ajustarSituacao (legado) - SQL original:
    // UPDATE bas_conta con SET fl_situacao = case when
    // exists(select * from bas_conta_controle_pagamento pag where pag.id_conta = con.id and data_vencimento < current_date
    // and pag.data_aplicada is null) then true else false end where con.id = <id>
    public static final String SQL_AJUSTAR_SITUACAO =
            "UPDATE bas_conta con SET fl_situacao = case when " +
                    "exists(select * from bas_conta_controle_pagamento pag where pag.id_conta = con.id and data_vencimento < current_date " +
                    "and pag.data_aplicada is null) then true else false end where con.id = ?1";

    public Uni<Void> ajustarSituacao(Long contaId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AJUSTAR_SITUACAO)
                        .setParameter(1, contaId)
                        .executeUpdate())
                .replaceWithVoid();
    }

}
