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

@Service
public class ChatService {

    private final WebClient webClient;
    private final ProductRepository productRepository;
    private final ChatKnowledgeService knowledgeService;
    private final NotificationService notificationService;

    @Value("${OPENAI_API_KEY:}")
    private String openAiKey;

    public ChatService(
            ProductRepository productRepository,
            ChatKnowledgeService knowledgeService,
            NotificationService notificationService
    ) {
        this.productRepository = productRepository;
        this.knowledgeService = knowledgeService;
        this.notificationService = notificationService;
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com/v1/chat/completions")
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
        return llm(message, username);
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

    private ChatResponse llm(String msg, String username) {
        if (openAiKey == null || openAiKey.isBlank()) {
            return ChatResponse.builder()
                    .text("Activa la IA con la variable OPENAI_API_KEY.")
                    .build();
        }
        String knowledge = Optional.ofNullable(knowledgeService.latest())
                .map(k -> "\nContexto adicional:\n" + k.getContent())
                .orElse("");
        String prompt = ("Eres el asistente virtual de TecnoMarket. Responde en español, breve, usando soles (S/). " +
                "Métodos de pago: Tarjeta, PayPal, Yape (QR). Envío: rápido y con seguimiento en Perfil." + knowledge);
        String body = """
        {
          "model": "gpt-3.5-turbo",
          "messages": [
            {"role":"system","content":"%s"},
            {"role":"user","content":"%s"}
          ],
          "max_tokens": 200
        }
        """.formatted(prompt, msg);

        try {
            String text = webClient.post()
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + openAiKey)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(String.class)
                    .map(this::extractContent)
                    .onErrorResume(e -> Mono.just("No pude consultar IA ahora."))
                    .block();
            ChatResponse resp = ChatResponse.builder().text(text).build();
            maybeNotify(username, "Respuesta del bot", text, "BOT");
            return resp;
        } catch (Exception e) {
            return ChatResponse.builder().text("No pude consultar IA ahora.").build();
        }
    }

    private String extractContent(String json) {
        // Extracción simple; para producción usar un parser JSON
        int idx = json.indexOf("\"content\"");
        if (idx == -1) return "Aquí estoy para ayudarte.";
        int start = json.indexOf(":", idx);
        int firstQuote = json.indexOf("\"", start);
        int endQuote = json.indexOf("\"", firstQuote + 1);
        if (firstQuote == -1 || endQuote == -1) return "Aquí estoy para ayudarte.";
        return json.substring(firstQuote + 1, endQuote).replace("\\n", "\n");
    }

    private void maybeNotify(String username, String title, String message, String type) {
        if (username == null || username.isBlank()) return;
        try {
            notificationService.createForUsername(username, title, message, type);
        } catch (Exception ignored) {
            // No interrumpir la respuesta del bot
        }
    }
}
