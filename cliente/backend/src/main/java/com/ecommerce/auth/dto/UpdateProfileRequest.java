package com.ecommerce.auth.dto;

import jakarta.validation.constraints.Email;
import lombok.Data;

@Data
public class UpdateProfileRequest {
    private String nombre;

    @Email
    private String email;

    private String telefono;
    private String direccion;
}
