package com.ecommerce.cart.controller;

import com.ecommerce.cart.dto.AddCartItemRequest;
import com.ecommerce.cart.dto.CartResponse;
import com.ecommerce.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/cart")
@CrossOrigin(origins = "*")
public class CartController {

    @Autowired
    private CartService cartService;

    @GetMapping("/my-cart")
    public CartResponse myCart(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return cartService.getMyCart(username);
    }

    @PostMapping("/add")
    public CartResponse add(Authentication authentication, @Valid @RequestBody AddCartItemRequest request) {
        String username = authentication != null ? authentication.getName() : null;
        return cartService.addToCart(username, request);
    }

    @PutMapping("/increase/{itemId}")
    public CartResponse increase(Authentication authentication, @PathVariable Long itemId) {
        String username = authentication != null ? authentication.getName() : null;
        return cartService.increaseItem(username, itemId);
    }

    @PutMapping("/decrease/{itemId}")
    public CartResponse decrease(Authentication authentication, @PathVariable Long itemId) {
        String username = authentication != null ? authentication.getName() : null;
        return cartService.decreaseItem(username, itemId);
    }

    @DeleteMapping("/delete/{itemId}")
    public CartResponse delete(Authentication authentication, @PathVariable Long itemId) {
        String username = authentication != null ? authentication.getName() : null;
        return cartService.deleteItem(username, itemId);
    }

    @DeleteMapping("/clear")
    public void clear(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        cartService.clearCart(username);
    }
}
