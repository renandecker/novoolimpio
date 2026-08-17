package br.com.sol7.olimpio.login.permissao.service;

import br.com.sol7.olimpio.login.permissao.entity.Modulo;
import br.com.sol7.olimpio.login.permissao.entity.Perfil;
import br.com.sol7.olimpio.login.permissao.entity.PerfilModulo;
import br.com.sol7.olimpio.login.permissao.entity.UsuarioPerfil;
import io.quarkus.cache.CacheResult;
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

    private static final Set<String> ALL_PERMISSIONS = Set.of("READ", "CREATE", "UPDATE", "DELETE", "EXECUTE");

    /**
     * Resolve as permissões por módulo do usuário a partir de bas_usuario_perfil,
     * bas_perfil e bas_perfil_modulo (novo→CREATE, editar→UPDATE, remover→DELETE,
     * relatorio→EXECUTE; READ é sempre concedido). Chave = outcome do módulo
     * normalizado (sem extensão .xhtml e sem barras nas pontas).
     * Usuários com perfil de hierarquia ADMIN recebem acesso a todas as telas com
     * todas as permissões, conforme a regra do perfil Administrador (todos os
     * módulos). Quando o usuário não possui perfis vinculados (ex.: admin
     * bootstrap), o mapa é vazio e a aplicação usa as permissões globais do bas_login.
     */
    @CacheResult(cacheName = "login-menu-cache")
    public Uni<Map<String, Set<String>>> resolve(Long idUsuario) {
        if (idUsuario == null) return Uni.createFrom().item(Map.of());
        return UsuarioPerfil.<UsuarioPerfil>find("usuarioId", idUsuario).list()
                .onItem().transformToUni(vinculos -> {
                    if (vinculos == null || vinculos.isEmpty()) return Uni.createFrom().item(Map.of());
                    List<Long> perfilIds = vinculos.stream().map(v -> v.perfilId).distinct().toList();
                    return Perfil.<Perfil>find("id in ?1", perfilIds).list()
                            .onItem().transformToUni(perfis -> {
                                if (perfis.stream().anyMatch(this::isAdmin)) return todosOsModulos();
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

    /**
     * Informa se o usuário possui ao menos um perfil administrativo. Essa regra não
     * depende do nome do login: qualquer usuário vinculado a um perfil de
     * hierarquia ADMIN deve receber as permissões globais do administrador.
     */
    @CacheResult(cacheName = "login-admin-cache")
    public Uni<Boolean> isAdministrator(Long idUsuario) {
        if (idUsuario == null) return Uni.createFrom().item(false);
        return UsuarioPerfil.<UsuarioPerfil>find("usuarioId", idUsuario).list()
                .onItem().transformToUni(vinculos -> {
                    if (vinculos == null || vinculos.isEmpty()) return Uni.createFrom().item(false);
                    List<Long> perfilIds = vinculos.stream().map(v -> v.perfilId).distinct().toList();
                    return Perfil.<Perfil>find("id in ?1", perfilIds).list()
                            .map(perfis -> perfis.stream().anyMatch(this::isAdmin));
                });
    }

    private boolean isAdmin(Perfil perfil) {
        return perfil != null && perfil.hierarquia != null && perfil.hierarquia.trim().equalsIgnoreCase("ADMIN");
    }

    private Uni<Map<String, Set<String>>> todosOsModulos() {
        return Modulo.<Modulo>findAll().list().map(modulos -> {
            Map<String, Set<String>> mapa = new LinkedHashMap<>();
            for (Modulo modulo : modulos) {
                if (modulo.outcome == null || modulo.outcome.isBlank()) continue;
                mapa.put(normalizar(modulo.outcome), new LinkedHashSet<>(ALL_PERMISSIONS));
            }
            return mapa;
        });
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
