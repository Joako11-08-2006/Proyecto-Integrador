package com.ecommerce.cart.service;

import com.ecommerce.auth.entity.AuthUser;
import com.ecommerce.auth.repository.AuthUserRepository;
import com.ecommerce.cart.dto.AddCartItemRequest;
import com.ecommerce.cart.dto.CartItemResponse;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.entity.Cart;
import com.ecommerce.cart.entity.CartItem;
import com.ecommerce.cart.entity.Product;
import com.ecommerce.cart.repository.CartItemRepository;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.cart.repository.ProductRepository;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class CartService {

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private AuthUserRepository authUserRepository;

    @Transactional
    public CartResponse addToCart(String username, AddCartItemRequest request) {
        AuthUser user = getUser(username);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseGet(() -> createCart(user));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Producto no encontrado"));

        int qty = Math.max(1, request.getQuantity());
        CartItem item = cart.getItems().stream()
                .filter(ci -> ci.getProductId().equals(product.getId()))
                .findFirst()
                .orElse(null);

        if (item == null) {
            item = new CartItem();
            item.setCart(cart);
            item.setProductId(product.getId());
            item.setProductName(product.getNombre());
            item.setUnitPrice(effectivePrice(product));
            item.setQuantity(qty);
            cart.getItems().add(item);
        } else {
            item.setQuantity(item.getQuantity() + qty);
        }

        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        cartItemRepository.save(item);

        return toResponse(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getMyCart(String username) {
        AuthUser user = getUser(username);
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null) {
            return CartResponse.builder()
                    .id(null)
                    .items(List.of())
                    .total(BigDecimal.ZERO)
                    .build();
        }
        return toResponse(cart);
    }

    @Transactional
    public CartResponse increaseItem(String username, Long itemId) {
        AuthUser user = getUser(username);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carrito no encontrado"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item no encontrado"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Item no pertenece al carrito");
        }

        item.setQuantity(item.getQuantity() + 1);
        cart.setUpdatedAt(LocalDateTime.now());
        cartItemRepository.save(item);
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse decreaseItem(String username, Long itemId) {
        AuthUser user = getUser(username);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carrito no encontrado"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item no encontrado"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Item no pertenece al carrito");
        }

        int newQty = item.getQuantity() - 1;
        if (newQty <= 0) {
            cart.getItems().remove(item);
            cartItemRepository.delete(item);
        } else {
            item.setQuantity(newQty);
            cartItemRepository.save(item);
        }
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public CartResponse deleteItem(String username, Long itemId) {
        AuthUser user = getUser(username);
        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Carrito no encontrado"));

        CartItem item = cartItemRepository.findById(itemId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Item no encontrado"));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Item no pertenece al carrito");
        }

        cart.getItems().remove(item);
        cartItemRepository.delete(item);
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
        return toResponse(cart);
    }

    @Transactional
    public void clearCart(String username) {
        AuthUser user = getUser(username);
        Cart cart = cartRepository.findByUserId(user.getId()).orElse(null);
        if (cart == null) {
            return;
        }
        cartItemRepository.deleteAll(cart.getItems());
        cart.getItems().clear();
        cart.setUpdatedAt(LocalDateTime.now());
        cartRepository.save(cart);
    }

    private AuthUser getUser(String username) {
        return authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    private Cart createCart(AuthUser user) {
        Cart cart = new Cart();
        cart.setUser(user);
        cart.setCreatedAt(LocalDateTime.now());
        cart.setUpdatedAt(LocalDateTime.now());
        return cartRepository.save(cart);
    }

    private CartResponse toResponse(Cart cart) {
        List<CartItemResponse> items = cart.getItems().stream()
                .map(ci -> CartItemResponse.builder()
                        .id(ci.getId())
                        .productId(ci.getProductId())
                        .productName(ci.getProductName())
                        .unitPrice(ci.getUnitPrice())
                        .quantity(ci.getQuantity())
                        .subtotal(ci.getSubtotal())
                        .build())
                .collect(Collectors.toList());

        BigDecimal total = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return CartResponse.builder()
                .id(cart.getId())
                .items(items)
                .total(total)
                .build();
    }

    private BigDecimal effectivePrice(Product product) {
        if (product.getPrecio() == null) return BigDecimal.ZERO;
        Integer desc = product.getDescuento() == null ? 0 : product.getDescuento();
        if (desc <= 0) return product.getPrecio();
        BigDecimal factor = BigDecimal.valueOf(100 - desc).divide(BigDecimal.valueOf(100));
        return product.getPrecio().multiply(factor);
    }
}
