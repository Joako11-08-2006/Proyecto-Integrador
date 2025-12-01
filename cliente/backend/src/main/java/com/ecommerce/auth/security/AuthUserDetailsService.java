package com.ecommerce.auth.security;

import com.ecommerce.auth.entity.AuthUser;
import com.ecommerce.auth.entity.Cliente;
import com.ecommerce.auth.repository.AuthUserRepository;
import com.ecommerce.auth.repository.ClienteRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class AuthUserDetailsService implements UserDetailsService {

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado"));

        String role = "CLIENTE";
        if (user.isSuperuser()) {
            role = "SUPERADMIN";
        } else if (user.isStaff()) {
            role = "ADMIN";
        } else {
            Cliente cliente = clienteRepository.findByUsuarioId(user.getId()).orElse(null);
            if (cliente != null && cliente.getRol() != null) {
                role = cliente.getRol().toUpperCase();
            }
        }

        List<SimpleGrantedAuthority> authorities = new ArrayList<>();
        authorities.add(new SimpleGrantedAuthority("ROLE_" + role));

        return new User(user.getUsername(), user.getPassword(), user.isActive(), true, true, true, authorities);
    }
}
