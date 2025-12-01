package com.ecommerce.chat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatKnowledgeRequest {
    @NotBlank
    private String title;
    @NotBlank
    private String content;
}
