package com.meritz.chat.service;

import com.meritz.chat.dto.ChatRequest;
import com.meritz.chat.dto.ChatResponse;
import com.meritz.chat.entity.Chat;
import com.meritz.chat.repository.ChatRepository;
import com.meritz.room.entity.Room;
import com.meritz.room.repository.RoomRepository;
import com.meritz.room.service.RoomService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final ChatRepository chatRepository;

    @Transactional
    public Chat create() {
        Chat chat = Chat.builder().messages("").build();
        chatRepository.save(chat);

        return chat;
    }

    @Transactional
    public ChatResponse updateChat(ChatRequest chatRequest, Long roomId) {
        StringBuilder sb = new StringBuilder();
        Chat chat = chatRepository.findById(roomId).get();

        if(chatRequest.getWriterId().equals("manager")) {
            sb.append("manager : ").append(chatRequest.getMessages()).append("\n");
        }
        else {
            sb.append("client : ").append(chatRequest.getMessages()).append("\n");
        }

        chat.updateChat(sb.toString());
        return new ChatResponse(roomId, chatRequest.getWriterId(), chatRequest.getMessages());
    }
}
