package com.ecommerce.auth.service;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.NotificationResponse;
import com.ecommerce.auth.dto.PasswordChangeRequest;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.dto.UpdateProfileRequest;
import com.ecommerce.auth.dto.UserProfileResponse;
import com.ecommerce.auth.entity.AuthUser;
import com.ecommerce.auth.entity.Cliente;
import com.ecommerce.auth.repository.AuthUserRepository;
import com.ecommerce.auth.repository.ClienteRepository;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {

    private static final Pattern STRONG_PASSWORD = Pattern.compile("^(?=.*[A-Z])(?=.*[!@#$%^&*()_+\\-\\[\\]{};':\"\\\\|,.<>\\/?]).{8,}$");

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @Transactional
    public UserProfileResponse register(RegisterRequest request) {
        validateUniqueUser(request.getUsername(), request.getEmail());
        validatePasswordStrength(request.getPassword());

        AuthUser user = new AuthUser();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim());
        user.setFirstName("");
        user.setLastName("");
        user.setActive(true);
        user.setStaff(false);
        user.setSuperuser(false);
        user.setDateJoined(LocalDateTime.now());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        authUserRepository.save(user);

        Cliente cliente = new Cliente();
        cliente.setUsuario(user);
        cliente.setNombre(request.getNombre().trim());
        cliente.setEmail(request.getEmail().trim());
        cliente.setTelefono(Optional.ofNullable(request.getTelefono()).orElse("").trim());
        cliente.setDireccion(Optional.ofNullable(request.getDireccion()).orElse("").trim());
        cliente.setRol("Cliente");
        cliente.setCreadoEn(LocalDateTime.now());
        clienteRepository.save(cliente);

        return buildProfileResponse(user, cliente);
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        SecurityContextHolder.getContext().setAuthentication(authentication);

        AuthUser user = authUserRepository.findByUsername(request.getUsername())
                .or(() -> authUserRepository.findByEmail(request.getUsername()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        user.setLastLogin(LocalDateTime.now());
        authUserRepository.save(user);

        Cliente cliente = clienteRepository.findByUsuarioId(user.getId()).orElse(null);

        return LoginResponse.builder()
                .message("Login exitoso")
                .user(buildProfileResponse(user, cliente))
                .build();
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(String username) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Cliente cliente = clienteRepository.findByUsuarioId(user.getId()).orElse(null);
        return buildProfileResponse(user, cliente);
    }

    @Transactional
    public UserProfileResponse updateProfile(String username, UpdateProfileRequest request) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Cliente cliente = clienteRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (request.getEmail() != null && !request.getEmail().equalsIgnoreCase(user.getEmail())) {
            validateUniqueEmail(request.getEmail(), user.getId());
            user.setEmail(request.getEmail());
            cliente.setEmail(request.getEmail());
        }
        if (request.getNombre() != null) {
            cliente.setNombre(request.getNombre());
        }
        if (request.getTelefono() != null) {
            cliente.setTelefono(request.getTelefono());
        }
        if (request.getDireccion() != null) {
            cliente.setDireccion(request.getDireccion());
        }

        authUserRepository.save(user);
        clienteRepository.save(cliente);
        return buildProfileResponse(user, cliente);
    }

    @Transactional
    public void changePassword(String username, PasswordChangeRequest request) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contrasena actual no es correcta");
        }

        validatePasswordStrength(request.getNewPassword());
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        authUserRepository.save(user);
    }

    @Transactional
    public UserProfileResponse uploadPhoto(String username, MultipartFile file) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        Cliente cliente = clienteRepository.findByUsuarioId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Cliente no encontrado"));

        if (file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El archivo esta vacio");
        }

        String original = Optional.ofNullable(file.getOriginalFilename()).orElse("foto");
        String extension = "";
        int dot = original.lastIndexOf(".");
        if (dot != -1) {
            extension = original.substring(dot);
        }
        String filename = "perfil-" + user.getId() + "-" + System.currentTimeMillis() + extension;

        try {
            Path folder = Paths.get(uploadDir, "perfil");
            Files.createDirectories(folder);
            Path destination = folder.resolve(filename).toAbsolutePath().normalize();
            file.transferTo(destination);

            Map<String, Object> extras = cliente.getPermisosExtra();
            if (extras == null) {
                extras = new HashMap<>();
            }
            extras.put("fotoUrl", "/uploads/perfil/" + filename);
            cliente.setPermisosExtra(extras);
            clienteRepository.save(cliente);
        } catch (IOException e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la foto", e);
        }

        return buildProfileResponse(user, cliente);
    }

    public List<NotificationResponse> getNotifications(String username) {
        authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
        List<NotificationResponse> notifications = new ArrayList<>();
        notifications.add(NotificationResponse.builder()
                .id("1")
                .titulo("Bienvenido")
                .mensaje("Tu cuenta ha sido creada correctamente.")
                .leido(true)
                .creadoEn(LocalDateTime.now().minusDays(1))
                .build());
        notifications.add(NotificationResponse.builder()
                .id("2")
                .titulo("Actualizacion de perfil")
                .mensaje("Recuerda completar tu informacion de contacto.")
                .leido(false)
                .creadoEn(LocalDateTime.now().minusHours(5))
                .build());
        return notifications;
    }

    private void validateUniqueUser(String username, String email) {
        authUserRepository.findByUsername(username).ifPresent(u -> {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El nombre de usuario ya existe");
        });
        validateUniqueEmail(email, null);
    }

    private void validateUniqueEmail(String email, Long currentUserId) {
        authUserRepository.findByEmail(email).ifPresent(u -> {
            if (currentUserId == null || !u.getId().equals(currentUserId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya esta en uso");
            }
        });
        clienteRepository.findByEmail(email).ifPresent(c -> {
            if (currentUserId == null || (c.getUsuario() != null && !c.getUsuario().getId().equals(currentUserId))) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El email ya esta en uso");
            }
        });
    }

    private void validatePasswordStrength(String password) {
        if (password == null || !STRONG_PASSWORD.matcher(password).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La contrasena debe tener minimo 8 caracteres, una mayuscula y un caracter especial");
        }
    }

    private UserProfileResponse buildProfileResponse(AuthUser user, Cliente cliente) {
        String rol = "Cliente";
        Map<String, Object> extras = null;
        LocalDateTime creadoEn = null;
        String nombre = null;
        String telefono = null;
        String direccion = null;

        if (cliente != null) {
            rol = cliente.getRol() != null ? cliente.getRol() : rol;
            extras = cliente.getPermisosExtra();
            if (extras == null) {
                extras = new HashMap<>();
                cliente.setPermisosExtra(extras);
            }
            creadoEn = cliente.getCreadoEn();
            nombre = cliente.getNombre();
            telefono = cliente.getTelefono();
            direccion = cliente.getDireccion();
        } else if (user.isSuperuser()) {
            rol = "SuperAdmin";
        } else if (user.isStaff()) {
            rol = "Admin";
        }

        String fotoUrl = null;
        if (extras != null && extras.get("fotoUrl") != null) {
            fotoUrl = extras.get("fotoUrl").toString();
        }

        return UserProfileResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .nombre(nombre)
                .telefono(telefono)
                .direccion(direccion)
                .rol(rol)
                .permisosExtra(extras)
                .creadoEn(creadoEn)
                .fotoUrl(fotoUrl)
                .build();
    }
}
