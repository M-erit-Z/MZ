package com.meritz.chat.dto;

import lombok.Data;

@Data
public class ChatDto {

    private Integer channelId;
    private String writerId;
    private String chat;
}
