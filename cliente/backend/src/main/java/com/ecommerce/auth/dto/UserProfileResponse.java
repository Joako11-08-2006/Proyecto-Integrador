package com.ecommerce.auth.dto;

import java.time.LocalDateTime;
import java.util.Map;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String nombre;
    private String telefono;
    private String direccion;
    private String rol;
    private Map<String, Object> permisosExtra;
    private LocalDateTime creadoEn;
    private String fotoUrl;
}
