package com.ecommerce.auth.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationResponse {
    private String id;
    private String titulo;
    private String mensaje;
    private boolean leido;
    private LocalDateTime creadoEn;
}
