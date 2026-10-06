package br.com.sol7.olimpio.basico.gestaocontas.repository;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

import java.util.List;

import br.com.sol7.olimpio.basico.gestaocontas.entity.GestaoContas;

@ApplicationScoped
public class GestaoContasRepository implements PanacheRepository<GestaoContas> {

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

    // Migrado de DiaSemanaRepository.autocomplete
    // (extracted_aceso/src/main/java/br/com/sol7/olimpio/repository/repositories/basico/DiaSemanaRepository.java)
    // JPQL original: select d from DiaSemana d where lower(d.nome) like '%' || ?1 || '%' OR str(d.id) = ?1 order by d.id
    // Sem entidade DiaSemana neste microservico; projetado direto para o id, que e o contrato do endpoint.
    public static final String SQL_AUTO_COMPLETE_DIA_SEMANA =
            "SELECT d.id FROM bas_dia_semana d WHERE lower(d.nome) like '%' || ?1 || '%' OR CAST(d.id AS text) = ?1 ORDER BY d.id";

    public Uni<List<Long>> findByDiaSemanaQuery(String query) {
        String q = query == null ? "" : query.trim().toLowerCase();
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_AUTO_COMPLETE_DIA_SEMANA)
                        .setParameter(1, q)
                        .getResultList())
                .map(rows -> rows.stream()
                        .map(row -> row instanceof Number n ? n.longValue() : Long.valueOf(row.toString()))
                        .toList());
    }

}
