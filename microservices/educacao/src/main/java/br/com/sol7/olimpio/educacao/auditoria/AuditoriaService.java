package br.com.sol7.olimpio.educacao.auditoria;

import br.com.sol7.olimpio.educacao.auditoria.dto.AuditoriaCampo;
import br.com.sol7.olimpio.educacao.auditoria.dto.AuditoriaResponse;
import br.com.sol7.olimpio.shared.PagedResponse;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.Tuple;
import jakarta.ws.rs.BadRequestException;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
public class AuditoriaService {

    private static final Set<String> CAMPOS_META = Set.of("id", "rev", "revtype", "rev_timestamp", "rev_usuario", "rev_action");

    private static final Map<Integer, String> ACOES = Map.of(
            0, "Inclusão",
            1, "Alteração",
            2, "Exclusão");

    @Inject
    AuditoriaRepository repository;

    public Uni<PagedResponse<AuditoriaResponse>> paged(String entidade, int page, int size) {
        if (entidade == null || !repository.existeEntidade(entidade)) {
            return Uni.createFrom().failure(new BadRequestException("Entidade de auditoria inválida: " + entidade));
        }
        int p = Math.max(0, page);
        int s = (size == 10 || size == 20 || size == 50 || size == 100) ? size : 10;
        return repository.listar(entidade, p, s)
                .onItem().transformToUni(rows -> repository.contar(entidade)
                        .map(total -> new PagedResponse<>(
                                rows.stream().map(row -> toResponse(entidade, row)).toList(),
                                total, p, s)));
    }

    private AuditoriaResponse toResponse(String entidade, Tuple row) {
        Long id = numero(row, "id");
        Integer rev = inteiro(row, "rev");
        Integer revType = inteiro(row, "revtype");
        Date data = data(row, "rev_timestamp");
        String usuario = (String) row.get("rev_usuario");
        Integer action = inteiro(row, "rev_action");

        List<AuditoriaCampo> campos = new ArrayList<>();
        for (var element : row.getElements()) {
            String alias = element.getAlias();
            if (alias == null || CAMPOS_META.contains(alias)) {
                continue;
            }
            campos.add(new AuditoriaCampo(alias, row.get(alias)));
        }

        String acao = action == null ? null : ACOES.getOrDefault(action, "Rev. " + action);
        return new AuditoriaResponse(entidade, id, rev, revType, data, usuario, acao, campos);
    }

    private static Long numero(Tuple row, String alias) {
        Object valor = row.get(alias);
        return valor instanceof Number numero ? numero.longValue() : null;
    }

    private static Integer inteiro(Tuple row, String alias) {
        Object valor = row.get(alias);
        return valor instanceof Number numero ? numero.intValue() : null;
    }

    private static Date data(Tuple row, String alias) {
        Object valor = row.get(alias);
        if (valor instanceof Number numero){
            return new Date(numero.longValue());
        }
        return valor instanceof Date data ? data : null;
    }
}

