package com.tecsup.proyectointegrador.security.service;

import com.tecsup.proyectointegrador.model.User;
import com.tecsup.proyectointegrador.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User.UserBuilder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        com.tecsup.proyectointegrador.model.User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + username));

        UserBuilder builder = User.withUsername(user.getUsername());
        builder.password(user.getPassword());
        builder.roles("USER");
        return builder.build();
    }
}
