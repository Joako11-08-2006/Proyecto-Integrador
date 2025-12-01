package com.ecommerce.profile.dto;

import lombok.Data;

@Data
public class NotificationPreferenceRequest {
    private boolean promociones;
    private boolean emailAlerts;
    private boolean orderUpdates;
}
