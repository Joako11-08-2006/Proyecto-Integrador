package com.ecommerce.auth.controller;

import com.ecommerce.auth.dto.LoginRequest;
import com.ecommerce.auth.dto.LoginResponse;
import com.ecommerce.auth.dto.PasswordChangeRequest;
import com.ecommerce.auth.dto.RegisterRequest;
import com.ecommerce.auth.dto.UpdateProfileRequest;
import com.ecommerce.auth.dto.UserProfileResponse;
import com.ecommerce.auth.dto.NotificationResponse;
import com.ecommerce.auth.service.AuthService;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public LoginResponse login(@Validated @RequestBody LoginRequest login) {
        return authService.login(login);
    }

    @PostMapping("/register")
    public UserProfileResponse register(@Validated @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @GetMapping("/me")
    public UserProfileResponse me(Authentication authentication) {
        return authService.getProfile(authentication.getName());
    }

    @PutMapping("/me/profile")
    public UserProfileResponse updateProfile(
            Authentication authentication,
            @Validated @RequestBody UpdateProfileRequest request
    ) {
        return authService.updateProfile(authentication.getName(), request);
    }

    @PutMapping("/me/password")
    public String changePassword(
            Authentication authentication,
            @Validated @RequestBody PasswordChangeRequest request
    ) {
        authService.changePassword(authentication.getName(), request);
        return "Contrasena actualizada";
    }

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public UserProfileResponse uploadPhoto(
            Authentication authentication,
            @RequestPart("file") MultipartFile file
    ) {
        return authService.uploadPhoto(authentication.getName(), file);
    }

    @GetMapping("/me/notifications")
    public List<NotificationResponse> notifications(Authentication authentication) {
        return authService.getNotifications(authentication.getName());
    }

    @PostMapping("/2fa/verify")
    public String verify2fa(@RequestParam("code") @NotBlank String code) {
        // 2FA simulado: código fijo configurable
        String expected = System.getenv().getOrDefault("TWO_FA_CODE", "123456");
        if (!expected.equals(code)) {
            throw new IllegalArgumentException("Código 2FA inválido");
        }
        return "2FA verificado";
    }
}
