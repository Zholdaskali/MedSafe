package com.example.MedSafe.service;

import com.example.MedSafe.model.Role;
import com.example.MedSafe.model.SecurityKey;
import com.example.MedSafe.model.User;
import com.example.MedSafe.repository.RoleRepository;
import com.example.MedSafe.repository.SecurityKeyRepository;
import com.example.MedSafe.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Signature;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Collections;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {
    private static final Logger logger = LoggerFactory.getLogger(AuthService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final SecurityKeyRepository securityKeyRepository;
    private final PasswordEncoder passwordEncoder;

    public User registerUser(String username, String password, String email, String firstName, String lastName, Integer roleId) {
        logger.info("Регистрация пользователя: username={}", username);
        if (userRepository.existsByUsername(username)) {
            logger.error("Имя пользователя {} уже занято", username);
            throw new RuntimeException("Username already taken");
        }

        Role userRole = roleRepository.findById(roleId)
                .orElseThrow(() -> {
                    logger.error("Роль ROLE_USER не найдена");
                    return new RuntimeException("Default role not found");
                });

        User user = new User();
        user.setUsername(username);
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setEmail(email);
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
        user.setRoles(Collections.singleton(userRole));

        User savedUser = userRepository.save(user);
        logger.info("Пользователь успешно зарегистрирован: userId={}", savedUser.getUserId());
        return savedUser;
    }

    public User loginUser(String username, String password) {
        logger.info("Попытка входа по паролю: username={}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("Пользователь {} не найден", username);
                    return new RuntimeException("User not found");
                });

        if (!passwordEncoder.matches(password, user.getPasswordHash())) {
            logger.error("Неверные учетные данные для пользователя {}", username);
            throw new RuntimeException("Invalid credentials");
        }

        logger.info("Успешный вход по паролю: userId={}", user.getUserId());
        return user;
    }

    public User loginWithPrivateKey(String username, String privateKey) throws Exception {
        logger.info("Попытка входа по приватному ключу: username={}", username);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> {
                    logger.error("Пользователь {} не найден", username);
                    return new RuntimeException("User not found");
                });

        SecurityKey securityKey = securityKeyRepository.findByUserUserId(user.getUserId())
                .orElseThrow(() -> {
                    logger.error("Ключи для пользователя {} не найдены", username);
                    return new RuntimeException("Security key not found");
                });

        // Генерация случайного сообщения для подписи
        String challenge = UUID.randomUUID().toString();
        logger.debug("Сгенерировано случайное сообщение для подписи: {}", challenge);

        try {
            // Подготовка приватного ключа
            String privateKeyContent = privateKey
                    .replaceAll("\\n", "")
                    .replace("-----BEGIN PRIVATE KEY-----", "")
                    .replace("-----END PRIVATE KEY-----", "")
                    .trim();

            if (!privateKeyContent.matches("^[A-Za-z0-9+/=]+$")) {
                logger.error("Некорректный формат приватного ключа для пользователя {}", username);
                throw new IllegalArgumentException("Invalid private key format");
            }

            byte[] privateBytes = Base64.getDecoder().decode(privateKeyContent);
            KeyFactory keyFactory = KeyFactory.getInstance("RSA");
            PrivateKey parsedPrivateKey = keyFactory.generatePrivate(new java.security.spec.PKCS8EncodedKeySpec(privateBytes));

            // Подпись сообщения с помощью приватного ключа
            Signature signer = Signature.getInstance("SHA256withRSA");
            signer.initSign(parsedPrivateKey);
            signer.update(challenge.getBytes());
            byte[] signature = signer.sign();

            // Подготовка публичного ключа
            byte[] publicBytes = Base64.getDecoder().decode(securityKey.getPublicKey());
            PublicKey publicKey = keyFactory.generatePublic(new java.security.spec.X509EncodedKeySpec(publicBytes));

            // Проверка подписи с помощью публичного ключа
            Signature verifier = Signature.getInstance("SHA256withRSA");
            verifier.initVerify(publicKey);
            verifier.update(challenge.getBytes());
            boolean isValid = verifier.verify(signature);

            if (!isValid) {
                logger.error("Неверная подпись для пользователя {}", username);
                throw new RuntimeException("Invalid private key");
            }

            logger.info("Успешный вход по приватному ключу: userId={}", user.getUserId());
            return user;
        } catch (Exception e) {
            logger.error("Ошибка при проверке приватного ключа для пользователя {}: {}", username, e.getMessage());
            throw new RuntimeException("Failed to authenticate with private key: " + e.getMessage(), e);
        }
    }
}