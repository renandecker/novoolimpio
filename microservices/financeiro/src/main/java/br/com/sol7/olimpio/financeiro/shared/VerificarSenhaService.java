package br.com.sol7.olimpio.financeiro.shared;

import io.quarkus.hibernate.reactive.panache.Panache;
import io.smallrye.mutiny.Uni;
import jakarta.enterprise.context.ApplicationScoped;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

// UsuarioService.findByLoginAndSenha. Consulta o bas_usuario diretamente (SQL nativo no mesmo
// Postgres compartilhado) e aceita tanto a senha crua (fluxo do microsservico basico) quanto o
// SHA-256 uppercase hex gravado pelo legado (PwUtil.encryptPassword).
@ApplicationScoped
public class VerificarSenhaService {

    public static final String SQL_BUSCAR_SENHA = "SELECT senha FROM bas_usuario WHERE id = ?1 AND fl_ativo = true";

    public Uni<Boolean> verificar(Long usuarioId, String senhaDigita) {
        if (usuarioId == null || senhaDigita == null || senhaDigita.isBlank()) {
            return Uni.createFrom().item(false);
        }
        return Panache.getSession()
                .chain(session -> session.createNativeQuery(SQL_BUSCAR_SENHA)
                        .setParameter(1, usuarioId)
                        .getResultList())
                .map(lista -> {
                    if (lista.isEmpty()) {
                        return false;
                    }
                    String senhaArmazenada = lista.get(0) != null ? lista.get(0).toString() : null;
                    if (senhaArmazenada == null) {
                        return false;
                    }
                    if (senhaArmazenada.equals(senhaDigita)) {
                        return true;
                    }
                    try {
                        return senhaArmazenada.equalsIgnoreCase(sha256Hex(senhaDigita));
                    } catch (NoSuchAlgorithmException e) {
                        return false;
                    }
                });
    }

    private String sha256Hex(String pass) throws NoSuchAlgorithmException {
        MessageDigest algorithm = MessageDigest.getInstance("SHA-256");
        byte[] messageDigest = algorithm.digest(pass.getBytes(StandardCharsets.UTF_8));
        StringBuilder passwd = new StringBuilder();
        for (byte b : messageDigest) {
            passwd.append(String.format("%02X", 0xFF & b));
        }
        return passwd.toString();
    }
}