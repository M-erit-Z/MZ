package com.meritz.chat.controller;

import com.meritz.chat.dto.ChatDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
public class ChatController {
    @MessageMapping("/chat/sendMessage/{roomId}")
    @SendTo("/topic/{roomId}")
    public ChatDto sendMessage(ChatDto chatDto, @DestinationVariable(value = "roomId") String roomId) {
        log.info(chatDto.toString() + "from " + roomId + "room");
        return chatDto;
    }
}
