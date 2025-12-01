package com.ecommerce.profile.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NotificationPreferenceResponse {
    private boolean promociones;
    private boolean emailAlerts;
    private boolean orderUpdates;
}
