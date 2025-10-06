package com.tecsup.proyectointegrador.controller;

import com.tecsup.proyectointegrador.model.User;
import com.tecsup.proyectointegrador.repository.UserRepository;
import com.tecsup.proyectointegrador.security.jwt.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    // Registro
    @PostMapping("/register")
    public User register(@RequestBody User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    // Login
    @PostMapping("/login")
    public Map<String, String> login(@RequestBody User user) {
        User foundUser = userRepository.findByUsername(user.getUsername())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(user.getPassword(), foundUser.getPassword())) {
            throw new RuntimeException("Contraseña incorrecta");
        }

        String token = jwtUtil.generateToken(foundUser.getUsername());

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("username", foundUser.getUsername());
        return response;
    }
}
