package com.meritz.room.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    public void sendEmail(String toEmail, String clientName, Long roomId, StringBuilder content) {
        MimeMessage mimeMessage = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(mimeMessage, "UTF-8");
        StringBuilder sb = new StringBuilder();

        sb.append(clientName).append(" 님의 ").append(roomId).append("번 사고 내역 입니다.");
        String title = sb.toString();

        try {
            helper.setTo(toEmail);
            helper.setSubject(title);
            helper.setText(content.toString());

            javaMailSender.send(mimeMessage);
        } catch (MessagingException e) {
            log.error("Failed to Send Email", e);
            throw new RuntimeException(e);
        }
    }

}
