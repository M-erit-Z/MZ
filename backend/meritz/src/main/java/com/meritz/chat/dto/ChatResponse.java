package com.meritz.chat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ChatResponse {

    private Long roomId;
    private String writerId;
    private String messages;

}
