package com.ecommerce.chat.dto;

import java.time.LocalDateTime;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatKnowledgeResponse {
    private Long id;
    private String title;
    private String content;
    private String updatedBy;
    private LocalDateTime updatedAt;
}
