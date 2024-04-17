package com.meritz.websocket;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // broker uri 설정
        config.enableSimpleBroker("/topic");
        // send uri 설정
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // webSocket 접속 시, endpoint 설정
        registry.addEndpoint("/signaling")
                .setAllowedOriginPatterns("*") // cors에 따른 설정( *는 모두 허용 )
                .withSockJS(); // 브라우저에서 webSocket을 지원하지 않는 경우의 대안
    }
}