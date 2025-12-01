package com.ecommerce.auth.utils;

import javax.crypto.SecretKeyFactory;
import javax.crypto.spec.PBEKeySpec;
import java.security.SecureRandom;
import java.util.Base64;

public class DjangoPasswordUtils {

    private static final String ALGORITHM = "pbkdf2_sha256";
    private static final int ITERATIONS = 260000;
    private static final int KEY_LENGTH = 256;

    public static boolean checkPassword(String rawPassword, String djangoHash) {
        try {
            String[] parts = djangoHash.split("\\$");

            // pbkdf2_sha256$260000$salt$hash
            String algorithm = parts[0];
            int iterations = Integer.parseInt(parts[1]);
            String salt = parts[2];
            String hash = parts[3];

            PBEKeySpec spec = new PBEKeySpec(rawPassword.toCharArray(), salt.getBytes(), iterations, KEY_LENGTH);

            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] testHash = skf.generateSecret(spec).getEncoded();

            String encodedTestHash = Base64.getEncoder().encodeToString(testHash);

            return encodedTestHash.equals(hash);

        } catch (Exception e) {
            return false;
        }
    }

    public static String hashPassword(String rawPassword) {
        try {
            byte[] salt = new byte[16];
            new SecureRandom().nextBytes(salt);
            String saltBase64 = Base64.getEncoder().encodeToString(salt);

            PBEKeySpec spec = new PBEKeySpec(rawPassword.toCharArray(), saltBase64.getBytes(), ITERATIONS, KEY_LENGTH);
            SecretKeyFactory skf = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256");
            byte[] hash = skf.generateSecret(spec).getEncoded();
            String encodedHash = Base64.getEncoder().encodeToString(hash);

            return String.format("%s$%d$%s$%s", ALGORITHM, ITERATIONS, saltBase64, encodedHash);
        } catch (Exception e) {
            throw new IllegalStateException("No se pudo generar el hash de contrasena", e);
        }
    }
}
