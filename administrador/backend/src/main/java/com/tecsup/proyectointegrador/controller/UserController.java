package com.tecsup.proyectointegrador.controller;

import com.tecsup.proyectointegrador.model.User;
import com.tecsup.proyectointegrador.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // 🧾 Listar todos los usuarios
    @GetMapping
    public List<User> listarUsuarios() {
        return userRepository.findAll();
    }

    // 🔍 Buscar usuario por ID
    @GetMapping("/{id}")
    public ResponseEntity<User> obtenerUsuario(@PathVariable Long id) {
        Optional<User> usuario = userRepository.findById(id);
        return usuario.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // ➕ Crear nuevo usuario
    @PostMapping
    public ResponseEntity<User> crearUsuario(@RequestBody User user) {
        User nuevo = userRepository.save(user);
        return ResponseEntity.ok(nuevo);
    }

    // ✏️ Actualizar usuario
    @PutMapping("/{id}")
    public ResponseEntity<User> actualizarUsuario(@PathVariable Long id, @RequestBody User userDetalles) {
        return userRepository.findById(id).map(user -> {
            user.setUsername(userDetalles.getUsername());
            user.setPassword(userDetalles.getPassword());
            user.setRoles(userDetalles.getRoles());
            return ResponseEntity.ok(userRepository.save(user));
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }

    // 🗑️ Eliminar usuario
    @DeleteMapping("/{id}")
    public ResponseEntity<?> eliminarUsuario(@PathVariable Long id) {
        return userRepository.findById(id).map(user -> {
            userRepository.delete(user);
            return ResponseEntity.ok("Usuario eliminado");
        }).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
