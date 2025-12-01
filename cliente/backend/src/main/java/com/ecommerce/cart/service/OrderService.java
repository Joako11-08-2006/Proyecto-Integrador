package com.ecommerce.cart.service;

import com.ecommerce.auth.entity.AuthUser;
import com.ecommerce.auth.repository.AuthUserRepository;
import com.ecommerce.cart.dto.OrderItemResponse;
import com.ecommerce.cart.dto.OrderResponse;
import com.ecommerce.cart.dto.ProductStat;
import com.ecommerce.cart.dto.ReceiptResponse;
import com.ecommerce.cart.dto.VoucherUploadResponse;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.entity.Order;
import com.ecommerce.cart.entity.OrderItem;
import com.ecommerce.cart.entity.Product;
import com.ecommerce.cart.repository.CartItemRepository;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.cart.repository.OrderItemRepository;
import com.ecommerce.cart.repository.OrderRepository;
import com.ecommerce.cart.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class OrderService {

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Transactional
    public OrderResponse createOrderFromCart(String username, String paymentMethod, String shippingAddress) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Carrito vacio"));

        if (cart.getItems().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Carrito vacio");
        }

        // Validar stock
        for (CartItem item : cart.getItems()) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));
            if (product.getStock() != null && product.getStock() < item.getQuantity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Sin stock para " + product.getNombre());
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.Status.CREATED);
        order.setCreatedAt(LocalDateTime.now());
        order.setPaymentMethod(paymentMethod);
        order.setPaymentStatus("PENDING");
        order.setShippingAddress(shippingAddress);
        order.setShippingStatus("PENDING");
        orderRepository.save(order);

        BigDecimal total = BigDecimal.ZERO;

        for (CartItem cartItem : cart.getItems()) {
            Product product = productRepository.findById(cartItem.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

            if (product.getStock() != null) {
                product.setStock(product.getStock() - cartItem.getQuantity());
                productRepository.save(product);
            }

            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProductId(cartItem.getProductId());
            oi.setProductName(cartItem.getProductName());
            oi.setQuantity(cartItem.getQuantity());
            oi.setUnitPrice(cartItem.getUnitPrice());
            oi.setLineTotal(cartItem.getSubtotal());
            total = total.add(cartItem.getSubtotal());
            orderItemRepository.save(oi);
        }

        order.setTotal(total);
        orderRepository.save(order);

        // Vaciar carrito
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cartRepository.save(cart);

        return toResponse(order);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> myOrders(String username) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
        List<Order> orders = orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        return orders.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> allOrders() {
        List<Order> orders = orderRepository.findAllByOrderByCreatedAtDesc();
        return orders.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ProductStat> topProducts() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .flatMap(o -> o.getItems().stream())
                .collect(Collectors.groupingBy(OrderItem::getProductName,
                        Collectors.reducing(new ProductStat("", 0, BigDecimal.ZERO),
                                oi -> new ProductStat(oi.getProductName(), oi.getQuantity(), oi.getLineTotal()),
                                ProductStat::merge)))
                .values().stream()
                .sorted((a, b) -> Integer.compare(b.getQuantity(), a.getQuantity()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String username, Long id) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));
        return toResponse(order);
    }

    @Transactional
    public void updateStatus(Long id, String status, String paymentStatus, String shippingStatus) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));
        if (status != null) {
            try {
                order.setStatus(Order.Status.valueOf(status));
            } catch (IllegalArgumentException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Status invalido");
            }
        }
        if (paymentStatus != null) {
            order.setPaymentStatus(paymentStatus);
            if ("PAID".equalsIgnoreCase(paymentStatus)) {
                order.setPaymentVerifiedAt(LocalDateTime.now());
            }
        }
        if (shippingStatus != null) {
            order.setShippingStatus(shippingStatus);
        }
        orderRepository.save(order);
    }

    @Transactional
    public VoucherUploadResponse uploadVoucher(Long orderId, String username, MultipartFile voucher, String operationCode) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));

        Order order = orderRepository.findByIdAndUserId(orderId, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));

        if (voucher == null || voucher.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Voucher obligatorio");
        }

        try {
            Path uploadsDir = Paths.get("uploads", "vouchers");
            Files.createDirectories(uploadsDir);
            String ext = obtenerExtension(voucher.getOriginalFilename());
            String filename = UUID.randomUUID() + (ext != null ? "." + ext : "");
            Path target = uploadsDir.resolve(filename);
            voucher.transferTo(target.toFile());

            order.setVoucherUrl("/" + target.toString().replace("\\", "/"));
            order.setOperationCode(operationCode);
            order.setPaymentStatus("EN_REVISION");
            orderRepository.save(order);

            return new VoucherUploadResponse("Voucher recibido, en revisión", order.getVoucherUrl(), order.getOperationCode());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar el voucher");
        }
    }

    @Transactional(readOnly = true)
    public ReceiptResponse getReceipt(String username, Long id) {
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
        Order order = orderRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Orden no encontrada"));

        List<OrderItemResponse> items = order.getItems().stream()
                .map(oi -> OrderItemResponse.builder()
                        .id(oi.getId())
                        .productId(oi.getProductId())
                        .productName(oi.getProductName())
                        .quantity(oi.getQuantity())
                        .unitPrice(oi.getUnitPrice())
                        .lineTotal(oi.getLineTotal())
                        .build())
                .collect(Collectors.toList());

        return ReceiptResponse.builder()
                .orderId(order.getId())
                .customerName(user.getUsername())
                .customerEmail(user.getEmail())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .operationCode(order.getOperationCode())
                .voucherUrl(order.getVoucherUrl())
                .shippingAddress(order.getShippingAddress())
                .createdAt(order.getCreatedAt())
                .paidAt(order.getPaymentVerifiedAt())
                .total(order.getTotal())
                .status(order.getStatus())
                .items(items)
                .build();
    }

    private String obtenerExtension(String name) {
        if (name == null) return null;
        int idx = name.lastIndexOf('.');
        if (idx == -1) return null;
        return name.substring(idx + 1);
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(oi -> OrderItemResponse.builder()
                        .id(oi.getId())
                        .productId(oi.getProductId())
                        .productName(oi.getProductName())
                        .quantity(oi.getQuantity())
                        .unitPrice(oi.getUnitPrice())
                        .lineTotal(oi.getLineTotal())
                        .build())
                .collect(Collectors.toList());

        return OrderResponse.builder()
                .id(order.getId())
                .total(order.getTotal())
                .status(order.getStatus())
                .paymentMethod(order.getPaymentMethod())
                .paymentStatus(order.getPaymentStatus())
                .voucherUrl(order.getVoucherUrl())
                .operationCode(order.getOperationCode())
                .paymentVerifiedAt(order.getPaymentVerifiedAt())
                .shippingAddress(order.getShippingAddress())
                .shippingStatus(order.getShippingStatus())
                .createdAt(order.getCreatedAt())
                .userId(order.getUser() != null ? order.getUser().getId() : null)
                .items(items)
                .build();
    }
}
