package com.ecommerce.profile.controller;

import com.ecommerce.auth.dto.PasswordChangeRequest;
import com.ecommerce.auth.dto.UpdateProfileRequest;
import com.ecommerce.auth.dto.UserProfileResponse;
import com.ecommerce.auth.service.AuthService;
import com.ecommerce.profile.dto.AddressRequest;
import com.ecommerce.profile.dto.AddressResponse;
import com.ecommerce.profile.dto.NotificationPreferenceRequest;
import com.ecommerce.profile.dto.NotificationPreferenceResponse;
import com.ecommerce.profile.service.ProfileService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    @Autowired
    private AuthService authService;

    @Autowired
    private ProfileService profileService;
    @GetMapping
    public UserProfileResponse profile(Authentication authentication) {
        return authService.getProfile(authentication.getName());
    }

    @PutMapping
    public UserProfileResponse update(Authentication authentication, @Valid @RequestBody UpdateProfileRequest request) {
        return authService.updateProfile(authentication.getName(), request);
    }

    @PutMapping("/password")
    public String changePassword(Authentication authentication, @Valid @RequestBody PasswordChangeRequest request) {
        authService.changePassword(authentication.getName(), request);
        return "Contrasena actualizada";
    }

    @GetMapping("/addresses")
    public List<AddressResponse> addresses(Authentication authentication) {
        return profileService.listAddresses(authentication.getName());
    }

    @PostMapping("/addresses")
    public AddressResponse createAddress(Authentication authentication, @Valid @RequestBody AddressRequest request) {
        return profileService.createAddress(authentication.getName(), request);
    }

    @PutMapping("/addresses/{id}")
    public AddressResponse updateAddress(Authentication authentication, @PathVariable Long id, @Valid @RequestBody AddressRequest request) {
        return profileService.updateAddress(authentication.getName(), id, request);
    }

    @DeleteMapping("/addresses/{id}")
    public void deleteAddress(Authentication authentication, @PathVariable Long id) {
        profileService.deleteAddress(authentication.getName(), id);
    }

    @GetMapping("/notifications")
    public NotificationPreferenceResponse getNotifications(Authentication authentication) {
        return profileService.getNotifications(authentication.getName());
    }

    @PutMapping("/notifications")
    public NotificationPreferenceResponse updateNotifications(Authentication authentication, @RequestBody NotificationPreferenceRequest request) {
        return profileService.updateNotifications(authentication.getName(), request);
    }

    @DeleteMapping("/delete-account")
    public String deleteAccount(Authentication authentication, @Valid @RequestBody DeleteAccountRequest request) {
        profileService.deleteAccount(authentication.getName(), request.getEmail());
        return "Cuenta eliminada";
    }

    @GetMapping("/summary")
    public SummaryResponse summary(Authentication authentication) {
        return profileService.summary(authentication.getName());
    }
}
