package com.meritz.chat.dto;

import lombok.Data;

@Data
public class ChatDto {

    private Integer roomId;
    private String writerId;
    private String messages;


}
