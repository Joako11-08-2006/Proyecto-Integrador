package com.ecommerce.profile.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AddressRequest {
    private String etiqueta;
    @NotBlank
    private String nombre;
    private String telefono;
    @NotBlank
    private String direccion;
    private String ciudad;
    private String estado;
    private String pais;
    private String zipCode;
    private boolean principal;
}
