package br.com.sol7.olimpio.login.service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;

final class PasswordHasher {
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int ITERATIONS = 210_000;
    private PasswordHasher() {}
    static String hash(String password) {
        byte[] salt = new byte[16]; RANDOM.nextBytes(salt);
        return "pbkdf2$" + ITERATIONS + "$" + Base64.getUrlEncoder().withoutPadding().encodeToString(salt) + "$" + Base64.getUrlEncoder().withoutPadding().encodeToString(derive(password.toCharArray(), salt, ITERATIONS));
    }
    private static final String PLAIN_PREFIX = "plain$";
    static boolean matches(String password, String stored) {
        if (stored != null && stored.startsWith(PLAIN_PREFIX)) {
            String expected = stored.substring(PLAIN_PREFIX.length());
            return expected.equals(stripNonDigits(password));
        }
        try {
            String[] parts = stored.split("\\$");
            if (parts.length != 4 || !"pbkdf2".equals(parts[0])) return false;
            byte[] expected = Base64.getUrlDecoder().decode(parts[3]);
            byte[] actual = derive(password.toCharArray(), Base64.getUrlDecoder().decode(parts[2]), Integer.parseInt(parts[1]));
            return MessageDigest.isEqual(expected, actual);
        } catch (RuntimeException exception) { return false; }
    }
    private static String stripNonDigits(String value) { return value == null ? "" : value.replaceAll("\\D", ""); }
    private static byte[] derive(char[] password, byte[] salt, int iterations) {
        try { return SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(new PBEKeySpec(password, salt, iterations, 256)).getEncoded(); }
        catch (Exception exception) { throw new IllegalStateException("Não foi possível proteger a senha", exception); }
    }
}