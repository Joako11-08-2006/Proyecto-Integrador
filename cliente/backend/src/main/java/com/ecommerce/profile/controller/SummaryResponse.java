package com.ecommerce.profile.controller;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class SummaryResponse {
    private BigDecimal totalGastado;
    private int numeroPedidos;
    private LocalDateTime ultimoPedido;
}
