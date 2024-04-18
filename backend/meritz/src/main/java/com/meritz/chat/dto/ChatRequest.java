package com.meritz.chat.dto;

import lombok.Data;

@Data
public class ChatRequest {

    private Long roomId;
    private String writerId;
    private String messages;

}
