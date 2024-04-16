package com.meritz;

import com.meritz.room.dto.CreateRoomRequest;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

@Controller
public class ThymeleafController {

    @GetMapping("/client/{roomId}")
    public String clientPage(@PathVariable("roomId") Long roomId, Model model) {
        model.addAttribute("roomId : ", roomId);
        return "client";
    }

    @GetMapping("/manager/{roomId}")
    public String managerPage(@PathVariable("roomId") Long roomId, @RequestBody CreateRoomRequest in, Model model) {
        model.addAttribute("roomId", roomId);
        model.addAttribute("roomRequest", in);
        return "manager";
    }

    @GetMapping("/record/{roomId}")
    public String recordPage(@PathVariable("roomId") Long roomId, Model model) {
        model.addAttribute("roomId : ", roomId);
        return "record";
    }
}
