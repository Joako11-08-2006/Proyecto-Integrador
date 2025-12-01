package com.ecommerce.cart.util;

import com.ecommerce.cart.entity.Category;
import com.ecommerce.cart.entity.Product;
import com.ecommerce.cart.repository.CategoryRepository;
import com.ecommerce.cart.repository.ProductRepository;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    public DataSeeder(CategoryRepository categoryRepository, ProductRepository productRepository) {
        this.categoryRepository = categoryRepository;
        this.productRepository = productRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        seedCategoriesAndProducts();
    }

    private void seedCategoriesAndProducts() {
        List<String> allowedBrands = List.of("Apple", "Samsung", "Xiaomi", "Redmi", "Google");

        // Elimina categorías que no estén en la lista y no tengan productos asociados
        categoryRepository.findAll().forEach(cat -> {
            if (!allowedBrands.contains(cat.getNombre())) {
                long count = productRepository.countByCategoriaId(cat.getId());
                if (count == 0) {
                    categoryRepository.delete(cat);
                }
            }
        });

        // Asegura que existan las categorías permitidas
        Map<String, Category> brandMap = new HashMap<>();
        for (String brand : allowedBrands) {
            Category cat = categoryRepository.findByNombreIgnoreCase(brand).orElseGet(() -> {
                Category c = new Category();
                c.setNombre(brand);
                return categoryRepository.save(c);
            });
            brandMap.put(brand, cat);
        }

        List<ProductSeed> seeds = new ArrayList<>();
        // Apple
        seeds.add(new ProductSeed("iPhone 15 Pro Max", "Apple", "6.7\" OLED 120Hz, A17 Pro, 8GB RAM, 256/512/1TB, 48+12+12MP, 4441mAh, iOS 17", 5699, 12));
        seeds.add(new ProductSeed("iPhone 15 Pro", "Apple", "6.1\" OLED 120Hz, A17 Pro, 8GB RAM, 128/256/512/1TB, 48+12+12MP, 3274mAh, iOS 17", 4999, 10));
        seeds.add(new ProductSeed("iPhone 15 Plus", "Apple", "6.7\" OLED 60Hz, A16 Bionic, 6GB RAM, 128/256/512GB, 48+12MP, 4383mAh, iOS 17", 4499, 15));
        seeds.add(new ProductSeed("iPhone 15", "Apple", "6.1\" OLED 60Hz, A16 Bionic, 6GB RAM, 128/256/512GB, 48+12MP, 3349mAh, iOS 17", 3999, 20));
        seeds.add(new ProductSeed("iPhone SE 2022", "Apple", "4.7\" Retina IPS, A15 Bionic, 4GB RAM, 64/128/256GB, 12MP, 2018mAh, iOS 17", 1999, 8));
        // Samsung
        seeds.add(new ProductSeed("Samsung Galaxy S24 Ultra", "Samsung", "6.8\" AMOLED 120Hz, Snapdragon 8 Gen 3, 12GB RAM, 256/512/1TB, 200+50+12+10MP, 5000mAh, Android 14", 5799, 18));
        seeds.add(new ProductSeed("Samsung Galaxy S24+", "Samsung", "6.7\" AMOLED 120Hz, Exynos 2400, 12GB RAM, 256/512GB, 50+12+10MP, 4900mAh, Android 14", 4499, 14));
        seeds.add(new ProductSeed("Samsung Galaxy S24", "Samsung", "6.2\" AMOLED 120Hz, Exynos 2400, 8GB RAM, 128/256/512GB, 50+12+10MP, 4000mAh, Android 14", 3999, 22));
        seeds.add(new ProductSeed("Samsung Galaxy A54", "Samsung", "6.4\" AMOLED 120Hz, Exynos 1380, 6/8GB RAM, 128/256GB, 50+12+5MP, 5000mAh, Android 14", 1899, 25));
        seeds.add(new ProductSeed("Samsung Galaxy A34", "Samsung", "6.6\" AMOLED 120Hz, Dimensity 1080, 6/8GB RAM, 128/256GB, 48+8+5MP, 5000mAh, Android 14", 1499, 30));
        // Xiaomi
        seeds.add(new ProductSeed("Xiaomi 14 Ultra", "Xiaomi", "6.73\" AMOLED 120Hz, Snapdragon 8 Gen 3, 12/16GB RAM, 256/512/1TB, 50MP quad, 5300mAh, HyperOS", 4999, 10));
        seeds.add(new ProductSeed("Xiaomi 14", "Xiaomi", "6.36\" AMOLED 120Hz, Snapdragon 8 Gen 3, 12GB RAM, 256/512GB, 50+50+50MP, 4610mAh, HyperOS", 3899, 15));
        seeds.add(new ProductSeed("Xiaomi 13T Pro", "Xiaomi", "6.67\" AMOLED 144Hz, Dimensity 9200+, 12/16GB RAM, 256/512/1TB, 50+50+12MP, 5000mAh, Android 14", 3299, 22));
        seeds.add(new ProductSeed("Xiaomi Poco F5", "Xiaomi", "6.67\" AMOLED 120Hz, Snapdragon 7+ Gen 2, 8/12GB RAM, 256GB, 64+8+2MP, 5000mAh, MIUI 14", 1899, 18));
        seeds.add(new ProductSeed("Xiaomi Poco X6 Pro", "Xiaomi", "6.67\" AMOLED 120Hz, Dimensity 8300 Ultra, 8/12GB RAM, 256/512GB, 64+8+2MP, 5000mAh, HyperOS", 1799, 20));
        // Redmi
        seeds.add(new ProductSeed("Redmi Note 13 Pro+", "Redmi", "6.67\" AMOLED 120Hz, Dimensity 7200 Ultra, 8/12GB RAM, 256/512GB, 200+8+2MP, 5000mAh, Android 14", 1599, 25));
        seeds.add(new ProductSeed("Redmi Note 13 Pro", "Redmi", "6.67\" AMOLED 120Hz, Snapdragon 7s Gen 2, 6/8/12GB RAM, 128/256/512GB, 200+8+2MP, 5100mAh, Android 14", 1399, 30));
        seeds.add(new ProductSeed("Redmi Note 13", "Redmi", "6.67\" AMOLED 120Hz, Helio G99, 4/6/8GB RAM, 128/256GB, 108+8+2MP, 5000mAh, Android 14", 1099, 40));
        seeds.add(new ProductSeed("Redmi 13C", "Redmi", "6.74\" IPS 90Hz, Helio G85, 4/6/8GB RAM, 64/128/256GB, 50+2MP, 5000mAh, MIUI 14", 799, 35));
        seeds.add(new ProductSeed("Redmi Note 12 Pro 5G", "Redmi", "6.67\" AMOLED 120Hz, Dimensity 1080, 6/8GB RAM, 128/256GB, 50+8+2MP, 5000mAh, Android 13", 1299, 28));
        // Google
        seeds.add(new ProductSeed("Google Pixel 8 Pro", "Google", "6.7\" LTPO OLED 120Hz, Tensor G3, 12GB RAM, 128/256/512/1TB, 50+48+48MP, 5050mAh, Android 14", 4499, 12));
        seeds.add(new ProductSeed("Google Pixel 8", "Google", "6.2\" OLED 120Hz, Tensor G3, 8GB RAM, 128/256GB, 50+12MP, 4575mAh, Android 14", 3199, 20));
        seeds.add(new ProductSeed("Google Pixel 7 Pro", "Google", "6.7\" OLED 120Hz, Tensor G2, 12GB RAM, 128/256/512GB, 50+48+12MP, 5000mAh, Android 14", 2999, 10));
        seeds.add(new ProductSeed("Google Pixel 7", "Google", "6.3\" OLED 90Hz, Tensor G2, 8GB RAM, 128/256GB, 50+12MP, 4355mAh, Android 14", 2499, 18));
        seeds.add(new ProductSeed("Pixel 7a", "Google", "6.1\" OLED 90Hz, Tensor G2, 8GB RAM, 128GB, 64+13MP, 4385mAh, Android 14", 2099, 25));

        for (ProductSeed seed : seeds) {
            Category cat = brandMap.get(seed.brand());
            if (cat == null) continue;
            Optional<Product> existing = productRepository.findByNombreIgnoreCase(seed.name());
            Product p = existing.orElseGet(Product::new);
            p.setNombre(seed.name());
            p.setDescripcion(seed.description());
            p.setPrecio(BigDecimal.valueOf(seed.price()));
            p.setStock(seed.stock());
            p.setCategoriaId(cat.getId());
            p.setDescuento(0);
            productRepository.save(p);
        }
    }

    private record ProductSeed(String name, String brand, String description, int price, int stock) {}
}
