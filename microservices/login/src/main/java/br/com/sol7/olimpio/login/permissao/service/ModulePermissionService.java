package br.com.sol7.olimpio.login.permissao.service;

import br.com.sol7.olimpio.login.permissao.entity.Modulo;
import br.com.sol7.olimpio.login.permissao.entity.Perfil;
import br.com.sol7.olimpio.login.permissao.entity.PerfilModulo;
import br.com.sol7.olimpio.login.permissao.entity.UsuarioPerfil;
import io.quarkus.hibernate.reactive.panache.common.WithTransaction;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@ApplicationScoped
@WithTransaction
public class ModulePermissionService {

    /**
     * Resolve as permissões por módulo do usuário a partir de bas_usuario_perfil,
     * bas_perfil e bas_perfil_modulo (novo→CREATE, editar→UPDATE, remover→DELETE,
     * relatorio→EXECUTE; READ é sempre concedido). Chave = outcome do módulo
     * normalizado (sem extensão .xhtml e sem barras nas pontas).
     * Quando o usuário não possui perfis vinculados (ex.: admin bootstrap), o mapa
     * é vazio e a aplicação usa as permissões globais do bas_login.
     */
    public Uni<Map<String, Set<String>>> resolve(Long idUsuario) {
        if (idUsuario == null) return Uni.createFrom().item(Map.of());
        return UsuarioPerfil.<UsuarioPerfil>find("usuarioId", idUsuario).list()
                .onItem().transformToUni(vinculos -> {
                    if (vinculos == null || vinculos.isEmpty()) return Uni.createFrom().item(Map.of());
                    List<Long> perfilIds = vinculos.stream().map(v -> v.perfilId).distinct().toList();
                    return Perfil.<Perfil>find("id in ?1", perfilIds).list()
                            .onItem().transformToUni(perfis -> {
                                if (perfis.stream().anyMatch(this::isAdmin)) return Uni.createFrom().item(Map.of());
                                return PerfilModulo.<PerfilModulo>find("perfilId in ?1", perfilIds).list()
                                        .onItem().transformToUni(acessos -> {
                                            if (acessos == null || acessos.isEmpty()) return Uni.createFrom().item(Map.of());
                                            List<Long> moduloIds = acessos.stream().map(a -> a.moduloId).distinct().toList();
                                            return Modulo.<Modulo>find("id in ?1", moduloIds).list()
                                                    .map(modulos -> montarMapa(acessos, modulos));
                                        });
                            });
                });
    }

    private boolean isAdmin(Perfil perfil) {
        return perfil != null && perfil.hierarquia != null && perfil.hierarquia.trim().equalsIgnoreCase("ADMIN");
    }

    private Map<String, Set<String>> montarMapa(List<PerfilModulo> acessos, List<Modulo> modulos) {
        Map<Long, String> outcomePorModulo = new LinkedHashMap<>();
        for (Modulo modulo : modulos) {
            if (modulo.outcome != null && !modulo.outcome.isBlank()) {
                outcomePorModulo.put(modulo.id, normalizar(modulo.outcome));
            }
        }
        Map<String, Set<String>> mapa = new LinkedHashMap<>();
        for (PerfilModulo acesso : acessos) {
            String outcome = outcomePorModulo.get(acesso.moduloId);
            if (outcome == null) continue;
            Set<String> perms = mapa.computeIfAbsent(outcome, k -> new LinkedHashSet<>(Set.of("READ")));
            if (Boolean.TRUE.equals(acesso.novo)) perms.add("CREATE");
            if (Boolean.TRUE.equals(acesso.editar)) perms.add("UPDATE");
            if (Boolean.TRUE.equals(acesso.remover)) perms.add("DELETE");
            if (Boolean.TRUE.equals(acesso.relatorio)) perms.add("EXECUTE");
        }
        return mapa;
    }

    private String normalizar(String outcome) {
        String valor = outcome.trim();
        if (valor.toLowerCase(java.util.Locale.ROOT).endsWith(".xhtml")) valor = valor.substring(0, valor.length() - ".xhtml".length());
        while (valor.startsWith("/")) valor = valor.substring(1);
        while (valor.endsWith("/")) valor = valor.substring(0, valor.length() - 1);
        return valor;
    }
}
