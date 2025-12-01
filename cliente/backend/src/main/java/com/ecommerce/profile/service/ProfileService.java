package com.ecommerce.profile.service;

import com.ecommerce.auth.entity.AuthUser;
import com.ecommerce.auth.repository.AuthUserRepository;
import com.ecommerce.auth.repository.ClienteRepository;
import com.ecommerce.cart.repository.CartItemRepository;
import com.ecommerce.cart.repository.CartRepository;
import com.ecommerce.cart.repository.OrderItemRepository;
import com.ecommerce.cart.repository.OrderRepository;
import com.ecommerce.profile.controller.SummaryResponse;
import com.ecommerce.notification.repository.NotificationRepository;
import com.ecommerce.profile.dto.AddressRequest;
import com.ecommerce.profile.dto.AddressResponse;
import com.ecommerce.profile.dto.NotificationPreferenceRequest;
import com.ecommerce.profile.dto.NotificationPreferenceResponse;
import com.ecommerce.profile.entity.Address;
import com.ecommerce.profile.entity.NotificationPreference;
import com.ecommerce.profile.repository.AddressRepository;
import com.ecommerce.profile.repository.NotificationPreferenceRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class ProfileService {

    @Autowired
    private AuthUserRepository authUserRepository;

    @Autowired
    private AddressRepository addressRepository;

    @Autowired
    private NotificationPreferenceRepository notificationPreferenceRepository;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private CartItemRepository cartItemRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;

    @Autowired
    private ClienteRepository clienteRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> listAddresses(String username) {
        AuthUser user = getUser(username);
        return addressRepository.findByUserId(user.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse createAddress(String username, AddressRequest request) {
        AuthUser user = getUser(username);
        Address address = new Address();
        address.setUser(user);
        address.setEtiqueta(request.getEtiqueta());
        address.setNombre(request.getNombre());
        address.setTelefono(request.getTelefono());
        address.setDireccion(request.getDireccion());
        address.setCiudad(request.getCiudad());
        address.setEstado(request.getEstado());
        address.setPais(request.getPais());
        address.setZipCode(request.getZipCode());
        address.setPrincipal(request.isPrincipal());
        address.setCreatedAt(LocalDateTime.now());
        address.setUpdatedAt(LocalDateTime.now());

        if (request.isPrincipal()) {
            unsetPrincipal(user.getId());
        }

        addressRepository.save(address);
        return toResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(String username, Long id, AddressRequest request) {
        AuthUser user = getUser(username);
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Direccion no encontrada"));

        address.setEtiqueta(request.getEtiqueta());
        address.setNombre(request.getNombre());
        address.setTelefono(request.getTelefono());
        address.setDireccion(request.getDireccion());
        address.setCiudad(request.getCiudad());
        address.setEstado(request.getEstado());
        address.setPais(request.getPais());
        address.setZipCode(request.getZipCode());
        address.setUpdatedAt(LocalDateTime.now());

        if (request.isPrincipal()) {
            unsetPrincipal(user.getId());
            address.setPrincipal(true);
        } else {
            address.setPrincipal(false);
        }

        addressRepository.save(address);
        return toResponse(address);
    }

    @Transactional
    public void deleteAddress(String username, Long id) {
        AuthUser user = getUser(username);
        Address address = addressRepository.findByIdAndUserId(id, user.getId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Direccion no encontrada"));
        addressRepository.delete(address);
    }

    @Transactional(readOnly = true)
    public NotificationPreferenceResponse getNotifications(String username) {
        AuthUser user = getUser(username);
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> defaultPref(user));
        return toResponse(pref);
    }

    @Transactional
    public NotificationPreferenceResponse updateNotifications(String username, NotificationPreferenceRequest request) {
        AuthUser user = getUser(username);
        NotificationPreference pref = notificationPreferenceRepository.findByUserId(user.getId())
                .orElseGet(() -> defaultPref(user));
        pref.setPromociones(request.isPromociones());
        pref.setEmailAlerts(request.isEmailAlerts());
        pref.setOrderUpdates(request.isOrderUpdates());
        notificationPreferenceRepository.save(pref);
        return toResponse(pref);
    }

    private AuthUser getUser(String username) {
        return authUserRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Usuario no encontrado"));
    }

    @Transactional
    public void deleteAccount(String username, String email) {
        AuthUser user = getUser(username);
        if (email == null || !email.equalsIgnoreCase(user.getEmail())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El correo no coincide");
        }

        // Notificaciones
        List<com.ecommerce.notification.entity.Notification> notes = notificationRepository.findByUserId(user.getId());
        notificationRepository.deleteAll(notes);

        // Direcciones
        addressRepository.deleteAll(addressRepository.findByUserId(user.getId()));

        // Carrito
        cartRepository.findByUserId(user.getId()).ifPresent(cart -> {
            cartItemRepository.deleteAllByCartId(cart.getId());
            cartRepository.delete(cart);
        });

        // Ordenes
        orderRepository.findByUserId(user.getId()).forEach(order -> {
            orderItemRepository.deleteAll(order.getItems());
            orderRepository.delete(order);
        });

        clienteRepository.findByUsuarioId(user.getId()).ifPresent(clienteRepository::delete);

        // Usuario
        authUserRepository.delete(user);
    }

    private void unsetPrincipal(Long userId) {
        addressRepository.findByUserId(userId).forEach(addr -> {
            if (addr.isPrincipal()) {
                addr.setPrincipal(false);
                addressRepository.save(addr);
            }
        });
    }

    private NotificationPreference defaultPref(AuthUser user) {
        NotificationPreference p = new NotificationPreference();
        p.setUser(user);
        p.setPromociones(true);
        p.setEmailAlerts(true);
        p.setOrderUpdates(true);
        return notificationPreferenceRepository.save(p);
    }

    private AddressResponse toResponse(Address address) {
        return AddressResponse.builder()
                .id(address.getId())
                .etiqueta(address.getEtiqueta())
                .nombre(address.getNombre())
                .telefono(address.getTelefono())
                .direccion(address.getDireccion())
                .ciudad(address.getCiudad())
                .estado(address.getEstado())
                .pais(address.getPais())
                .zipCode(address.getZipCode())
                .principal(address.isPrincipal())
                .build();
    }

    private NotificationPreferenceResponse toResponse(NotificationPreference pref) {
        return NotificationPreferenceResponse.builder()
                .promociones(pref.isPromociones())
                .emailAlerts(pref.isEmailAlerts())
                .orderUpdates(pref.isOrderUpdates())
                .build();
    }

    @Transactional(readOnly = true)
    public SummaryResponse summary(String username) {
        AuthUser user = getUser(username);
        List<com.ecommerce.cart.entity.Order> orders = orderRepository.findByUserId(user.getId());
        int numero = orders.size();
        java.math.BigDecimal total = orders.stream()
                .map(o -> o.getTotal() == null ? java.math.BigDecimal.ZERO : o.getTotal())
                .reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add);
        LocalDateTime ultimo = orders.stream()
                .map(com.ecommerce.cart.entity.Order::getCreatedAt)
                .filter(d -> d != null)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        return SummaryResponse.builder()
                .numeroPedidos(numero)
                .totalGastado(total)
                .ultimoPedido(ultimo)
                .build();
    }
}
