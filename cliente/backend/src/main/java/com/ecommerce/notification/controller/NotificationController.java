package com.ecommerce.notification.controller;

import com.ecommerce.notification.dto.NotificationDto;
import com.ecommerce.notification.service.NotificationService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    public List<NotificationDto> list(Authentication authentication) {
        return notificationService.myNotifications(authentication.getName());
    }

    @PutMapping("/{id}/read")
    public void markRead(Authentication authentication, @PathVariable Long id) {
        notificationService.markRead(authentication.getName(), id);
    }

    @PutMapping("/read-all")
    public void markAll(Authentication authentication) {
        notificationService.markAllRead(authentication.getName());
    }

    @DeleteMapping("/{id}")
    public void delete(Authentication authentication, @PathVariable Long id) {
        notificationService.delete(authentication.getName(), id);
    }
}
