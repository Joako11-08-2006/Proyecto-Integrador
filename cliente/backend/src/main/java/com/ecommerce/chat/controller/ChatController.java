package com.ecommerce.chat.controller;

import com.ecommerce.chat.dto.ChatRequest;
import com.ecommerce.chat.dto.ChatResponse;
import com.ecommerce.chat.service.ChatService;
import com.ecommerce.chat.dto.ChatStatusResponse;
import com.ecommerce.chat.dto.ChatHealthResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
public class ChatController {

    @Autowired
    private ChatService chatService;

    @PostMapping("/ask")
    public ChatResponse ask(Authentication authentication, @RequestBody ChatRequest req) {
        String username = authentication != null ? authentication.getName() : null;
        return chatService.reply(req.getMessage(), username);
    }

    @RequestMapping("/status")
    public ChatStatusResponse status() {
        return chatService.status();
    }

    @RequestMapping("/health")
    public ChatHealthResponse health() {
        return chatService.health();
    }
}
