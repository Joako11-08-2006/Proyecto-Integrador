package com.ecommerce.chat.service;

import com.ecommerce.chat.dto.ChatKnowledgeRequest;
import com.ecommerce.chat.dto.ChatKnowledgeResponse;
import com.ecommerce.chat.entity.ChatKnowledge;
import com.ecommerce.chat.repository.ChatKnowledgeRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ChatKnowledgeService {

    private final ChatKnowledgeRepository repository;

    public ChatKnowledgeService(ChatKnowledgeRepository repository) {
        this.repository = repository;
    }

    @Transactional(readOnly = true)
    public ChatKnowledgeResponse latest() {
        return repository.findTopByOrderByUpdatedAtDesc()
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ChatKnowledgeResponse> history() {
        return repository.findLatestHistory()
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ChatKnowledgeResponse update(ChatKnowledgeRequest request, String updatedBy) {
        ChatKnowledge k = new ChatKnowledge();
        k.setTitle(request.getTitle());
        k.setContent(request.getContent());
        k.setUpdatedBy(updatedBy);
        k.setUpdatedAt(LocalDateTime.now());
        repository.save(k);
        return toResponse(k);
    }

    private ChatKnowledgeResponse toResponse(ChatKnowledge k) {
        return ChatKnowledgeResponse.builder()
                .id(k.getId())
                .title(k.getTitle())
                .content(k.getContent())
                .updatedBy(k.getUpdatedBy())
                .updatedAt(k.getUpdatedAt())
                .build();
    }
}
