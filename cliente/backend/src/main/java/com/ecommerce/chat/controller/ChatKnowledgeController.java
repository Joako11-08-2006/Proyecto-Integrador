package com.ecommerce.chat.controller;

import com.ecommerce.chat.dto.ChatKnowledgeRequest;
import com.ecommerce.chat.dto.ChatKnowledgeResponse;
import com.ecommerce.chat.service.ChatKnowledgeService;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chat/knowledge")
@CrossOrigin(origins = "*")
public class ChatKnowledgeController {

    private final ChatKnowledgeService knowledgeService;

    public ChatKnowledgeController(ChatKnowledgeService knowledgeService) {
        this.knowledgeService = knowledgeService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ChatKnowledgeResponse getLatest() {
        return knowledgeService.latest();
    }

    @GetMapping("/history")
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public List<ChatKnowledgeResponse> history() {
        return knowledgeService.history();
    }

    @PutMapping
    @PreAuthorize("hasAnyRole('ADMIN','SUPERADMIN')")
    public ChatKnowledgeResponse update(Authentication authentication, @Validated @RequestBody ChatKnowledgeRequest request) {
        String username = authentication != null ? authentication.getName() : "admin";
        return knowledgeService.update(request, username);
    }
}
