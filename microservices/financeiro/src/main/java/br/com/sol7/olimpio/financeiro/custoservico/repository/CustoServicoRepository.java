package br.com.sol7.olimpio.financeiro.custoservico;

import java.util.List;

import io.quarkus.hibernate.reactive.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import io.smallrye.mutiny.Uni;

@ApplicationScoped
public class CustoServicoRepository implements PanacheRepository<CustoServico> {

    // select c from CustoServico c left join fetch c.unidades where c = ?1
    public static final String SQL_BUSCAR_CUSTO_SERVICO_COM_UNIDADE =
            "SELECT c.* FROM fin_custo_servico c WHERE c.id = ?1";

    public Uni<java.util.List<CustoServico>> buscarCustoServicoComUnidade(Long custoServicoId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CUSTO_SERVICO_COM_UNIDADE, CustoServico.class)
                        .setParameter(1, custoServicoId)
                        .getResultList());
    }


    // select distinct (c) from CustoServico c join c.unidades u where u = ?1 order by c.id desc
    public static final String SQL_BUSCAR_CUSTO_SERVICO_POR_UNIDADE =
            "SELECT DISTINCT c.* FROM fin_custo_servico c INNER JOIN fin_custo_servico_unidade c_u_jt ON c_u_jt.id_custo_servico = c.id INNER JOIN bas_unidade u ON u.id = c_u_jt.id_unidade WHERE u.id = ?1 ORDER BY c.id desc";

    public Uni<java.util.List<CustoServico>> buscarCustoServicoPorUnidade(Long unidadeId) {
        return io.quarkus.hibernate.reactive.panache.Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_CUSTO_SERVICO_POR_UNIDADE, CustoServico.class)
                        .setParameter(1, unidadeId)
                        .getResultList());
    }

}