package com.ecommerce.chat.service;

import com.ecommerce.cart.entity.Product;
import com.ecommerce.cart.repository.ProductRepository;
import com.ecommerce.chat.dto.ChatResponse;
import com.ecommerce.notification.service.NotificationService;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.time.Duration;

@Service
public class ChatService {

    private final WebClient geminiClient;
    private final com.ecommerce.chat.config.GeminiProperties gemini;
    private final ProductRepository productRepository;
    private final ChatKnowledgeService knowledgeService;
    private final NotificationService notificationService;
    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    

    public ChatService(
            ProductRepository productRepository,
            ChatKnowledgeService knowledgeService,
            NotificationService notificationService,
            com.ecommerce.chat.config.GeminiProperties gemini
    ) {
        this.productRepository = productRepository;
        this.knowledgeService = knowledgeService;
        this.notificationService = notificationService;
        this.gemini = gemini;
        this.geminiClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com/v1beta/models")
                .build();
    }

    public ChatResponse reply(String message, String username) {
        String lower = message == null ? "" : message.toLowerCase();
        if (lower.contains("promo") || lower.contains("descuento")) {
            ChatResponse resp = promos();
            maybeNotify(username, "Promo bot", resp.getText(), "BOT");
            return resp;
        }
        if (lower.contains("compar")) {
            ChatResponse resp = ChatResponse.builder()
                    .text("Puedes comparar hasta 3 productos en la pestaña Comparar. ¿Quieres ir ahora?")
                    .suggestions(List.of("Ir a Comparar", "Ver promociones"))
                    .build();
            maybeNotify(username, "Comparar modelos", "Te dejé un acceso a la sección Comparar.", "BOT");
            return resp;
        }
        if (lower.contains("pago")) {
            ChatResponse resp = ChatResponse.builder()
                    .text("Aceptamos Tarjeta, PayPal y Yape (QR). ¿Quieres ver el flujo de pago?")
                    .suggestions(List.of("Métodos de pago", "Ver carrito"))
                    .build();
            maybeNotify(username, "Pagos disponibles", resp.getText(), "BOT");
            return resp;
        }
        if (lower.contains("pedido") || lower.contains("orden")) {
            ChatResponse resp = ChatResponse.builder()
                    .text("Puedes ver tus pedidos en Perfil > Mis pedidos. ¿Quieres abrir perfil?")
                    .suggestions(List.of("Abrir perfil", "Ver carrito"))
                    .build();
            maybeNotify(username, "Seguimiento de pedido", "Revisa tus pedidos en Perfil > Mis pedidos.", "BOT");
            return resp;
        }
        if (lower.contains("hola") || lower.contains("buenas") || lower.contains("ayuda")) {
            return ChatResponse.builder()
                    .text("Hola, ¿en qué te ayudo?")
                    .suggestions(List.of("Ver promociones", "Comparar celulares", "Métodos de pago", "Estado de pedido"))
                    .build();
        }
        return gemini(message, username);
    }

    private ChatResponse promos() {
        List<Product> promos = productRepository.findAll().stream()
                .filter(p -> p.getDescuento() != null && p.getDescuento() > 0)
                .limit(5)
                .collect(Collectors.toList());
        if (promos.isEmpty()) {
            return ChatResponse.builder()
                    .text("Ahora mismo no veo promociones activas. ¿Quieres ver el catálogo?")
                    .suggestions(List.of("Ver catálogo", "Comparar celulares"))
                    .build();
        }
        String texto = promos.stream()
                .map(p -> String.format("%s - %s%% off: S/ %s",
                        p.getNombre(),
                        p.getDescuento(),
                        precioFinal(p)))
                .collect(Collectors.joining("\n"));
        return ChatResponse.builder()
                .text("Ofertas destacadas:\n" + texto)
                .suggestions(List.of("Ver carrito", "Comparar celulares"))
                .build();
    }

    private String precioFinal(Product p) {
        if (p.getPrecio() == null) return "-";
        Integer d = p.getDescuento() == null ? 0 : p.getDescuento();
        BigDecimal factor = BigDecimal.valueOf(100 - d).divide(BigDecimal.valueOf(100));
        return p.getPrecio().multiply(factor).toPlainString();
    }

    

    private void maybeNotify(String username, String title, String message, String type) {
        if (username == null || username.isBlank()) return;
        try {
            notificationService.createForUsername(username, title, message, type);
        } catch (Exception ignored) {
            // No interrumpir la respuesta del bot
        }
    }

    private ChatResponse gemini(String msg, String username) {
        String key = gemini.getApiKey();
        if (key == null || key.isBlank()) {
            return ChatResponse.builder()
                    .text("Activa la IA con la variable GEMINI_API_KEY.")
                    .build();
        }
        String knowledge = Optional.ofNullable(knowledgeService.latest())
                .map(k -> "\nContexto adicional:\n" + k.getContent())
                .orElse("");
        String prompt = ("Eres el asistente virtual de TecnoMarket. Responde en español, breve, usando soles (S/). " +
                "Métodos de pago: Tarjeta, PayPal, Yape (QR). Envío: rápido y con seguimiento en Perfil." + knowledge);
        String body;
        try {
            ObjectMapper mapper = new ObjectMapper();
            com.fasterxml.jackson.databind.node.ObjectNode root = mapper.createObjectNode();
            com.fasterxml.jackson.databind.node.ArrayNode contents = mapper.createArrayNode();
            com.fasterxml.jackson.databind.node.ObjectNode content = mapper.createObjectNode();
            com.fasterxml.jackson.databind.node.ArrayNode parts = mapper.createArrayNode();
            com.fasterxml.jackson.databind.node.ObjectNode text = mapper.createObjectNode();
            text.put("text", prompt + "\n\nPregunta: " + msg);
            parts.add(text);
            content.set("parts", parts);
            contents.add(content);
            root.set("contents", contents);
            body = mapper.writeValueAsString(root);
        } catch (Exception e) {
            body = "{\"contents\":[{\"parts\":[{\"text\":\"" + prompt.replace("\"","'") + "\\n\\nPregunta: " + msg.replace("\"","'") + "\"}]}]}";
        }

        try {
            String json = geminiClient.post()
                    .uri("/" + gemini.getModel() + ":generateContent?key=" + key)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(10))
                    .onErrorResume(e -> {
                        log.warn("Gemini error", e);
                        String msgErr = e.getMessage() == null ? "error" : e.getMessage().replace("\"","'");
                        return Mono.just("{\"error\":\"" + msgErr + "\"}");
                    })
                    .block();
            String textResp = extractGeminiContent(json);
            if (textResp.equals("Aquí estoy para ayudarte.") && json != null && json.contains("error")) {
                textResp = "No pude consultar IA ahora.";
            }
            ChatResponse resp = ChatResponse.builder().text(textResp).build();
            maybeNotify(username, "Respuesta del bot", textResp, "BOT");
            return resp;
        } catch (Exception e) {
            log.warn("Gemini call failed", e);
            return ChatResponse.builder().text("No pude consultar IA ahora.").build();
        }
    }

    private String extractGeminiContent(String json) {
        try {
            ObjectMapper mapper = new ObjectMapper();
            JsonNode root = mapper.readTree(json);
            JsonNode candidates = root.path("candidates");
            if (candidates.isArray() && candidates.size() > 0) {
                JsonNode parts = candidates.get(0).path("content").path("parts");
                if (parts.isArray() && parts.size() > 0) {
                    JsonNode text = parts.get(0).path("text");
                    if (!text.isMissingNode() && !text.isNull()) {
                        return text.asText();
                    }
                }
            }
        } catch (Exception ignored) {}
        return "Aquí estoy para ayudarte.";
    }

    public com.ecommerce.chat.dto.ChatStatusResponse status() {
        boolean enabled = gemini.getApiKey() != null && !gemini.getApiKey().isBlank();
        return com.ecommerce.chat.dto.ChatStatusResponse.builder()
                .enabled(enabled)
                .model(gemini.getModel())
                .build();
    }

    public com.ecommerce.chat.dto.ChatHealthResponse health() {
        String key = gemini.getApiKey();
        String model = gemini.getModel();
        if (key == null || key.isBlank()) {
            return com.ecommerce.chat.dto.ChatHealthResponse.builder()
                    .ok(false).provider("GEMINI").model(model)
                    .error("Missing GEMINI_API_KEY")
                    .build();
        }
        String body = "{\"contents\":[{\"parts\":[{\"text\":\"Di ok\"}]}]}";
        try {
            String json = geminiClient.post()
                    .uri("/" + model + ":generateContent?key=" + key)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(Duration.ofSeconds(6))
                    .onErrorResume(e -> Mono.just("{\"error\":\"" + (e.getMessage()==null?"error":e.getMessage()) + "\"}"))
                    .block();
            String text = extractGeminiContent(json);
            boolean ok = "ok".equalsIgnoreCase(text.trim());
            return com.ecommerce.chat.dto.ChatHealthResponse.builder()
                    .ok(ok).provider("GEMINI").model(model)
                    .message(text)
                    .error(json != null && json.contains("error") ? json : null)
                    .build();
        } catch (Exception e) {
            return com.ecommerce.chat.dto.ChatHealthResponse.builder()
                    .ok(false).provider("GEMINI").model(model)
                    .error(e.getMessage())
                    .build();
        }
    }
}
