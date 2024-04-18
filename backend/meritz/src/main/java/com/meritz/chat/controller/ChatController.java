package com.meritz.chat.controller;

import com.meritz.chat.dto.ChatRequest;
import com.meritz.chat.dto.ChatResponse;
import com.meritz.chat.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;
    @MessageMapping("/chat/sendMessage/{roomId}")
    @SendTo("/topic/{roomId}")
    public ChatResponse sendMessage(ChatRequest chatRequest, @DestinationVariable(value = "roomId") Long roomId) {
        log.info(chatRequest.toString() + "from " + roomId + "room");
        return chatService.updateChat(chatRequest, roomId);
    }
}
