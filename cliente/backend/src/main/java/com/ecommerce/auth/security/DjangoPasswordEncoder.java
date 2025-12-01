package com.ecommerce.auth.security;

import com.ecommerce.auth.utils.DjangoPasswordUtils;
import org.springframework.security.crypto.password.PasswordEncoder;

public class DjangoPasswordEncoder implements PasswordEncoder {

    @Override
    public String encode(CharSequence rawPassword) {
        return DjangoPasswordUtils.hashPassword(rawPassword.toString());
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return DjangoPasswordUtils.checkPassword(rawPassword.toString(), encodedPassword);
    }
}
