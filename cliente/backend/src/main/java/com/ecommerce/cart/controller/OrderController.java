package com.ecommerce.cart.controller;

import com.ecommerce.auth.entity.AuthUser;
import com.ecommerce.auth.repository.AuthUserRepository;
import com.ecommerce.cart.dto.CheckoutRequest;
import com.ecommerce.cart.dto.OrderResponse;
import com.ecommerce.cart.dto.ReceiptResponse;
import com.ecommerce.cart.dto.VoucherUploadResponse;
import com.ecommerce.cart.service.OrderService;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    @Autowired
    private OrderService orderService;
    @Autowired
    private AuthUserRepository authUserRepository;

    @PostMapping
    public OrderResponse create(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return orderService.createOrderFromCart(username, null, null);
    }

    @PostMapping("/checkout")
    public OrderResponse checkout(Authentication authentication, @RequestBody CheckoutRequest request) {
        String username = authentication != null ? authentication.getName() : null;
        String shippingAddress = String.join(" ",
                safe(request.getDireccion()),
                safe(request.getCiudad()),
                safe(request.getEstado()),
                safe(request.getPais()),
                safe(request.getZip()));
        return orderService.createOrderFromCart(username, request.getPaymentMethod(), shippingAddress.trim());
    }

    @GetMapping("/my-orders")
    public List<OrderResponse> myOrders(Authentication authentication) {
        String username = authentication != null ? authentication.getName() : null;
        return orderService.myOrders(username);
    }

    @GetMapping("/admin/all")
    public List<OrderResponse> all(Authentication authentication) {
        requireAdmin(authentication);
        return orderService.allOrders();
    }

    @GetMapping("/admin/top-products")
    public List<com.ecommerce.cart.dto.ProductStat> topProducts(Authentication authentication) {
        requireAdmin(authentication);
        return orderService.topProducts();
    }

    @GetMapping("/{id}")
    public OrderResponse get(Authentication authentication, @PathVariable Long id) {
        String username = authentication != null ? authentication.getName() : null;
        return orderService.getOrder(username, id);
    }

    @GetMapping("/{id}/receipt")
    public ReceiptResponse receipt(Authentication authentication, @PathVariable Long id) {
        String username = authentication != null ? authentication.getName() : null;
        return orderService.getReceipt(username, id);
    }

    @PostMapping("/{id}/voucher")
    public VoucherUploadResponse uploadVoucher(Authentication authentication,
                                               @PathVariable Long id,
                                               @RequestParam("file") MultipartFile file,
                                               @RequestParam(value = "operationCode", required = false) String operationCode) {
        String username = authentication != null ? authentication.getName() : null;
        if (username == null) throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        return orderService.uploadVoucher(id, username, file, operationCode);
    }

    @PutMapping("/{id}/status")
    public void updateStatus(Authentication authentication, @PathVariable Long id, @RequestBody OrderStatusRequest request) {
        requireAdmin(authentication);
        orderService.updateStatus(id, request.getStatus(), request.getPaymentStatus(), request.getShippingStatus());
    }

    private String safe(String s) {
        return s == null ? "" : s;
    }

    private void requireAdmin(Authentication authentication) {
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado");
        }
        String username = authentication.getName();
        AuthUser user = authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "No autenticado"));
        if (!user.isStaff() && !user.isSuperuser()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Solo admin/superadmin");
        }
    }
}
