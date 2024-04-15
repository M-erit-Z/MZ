package com.meritz;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ThymeleafController {

    @GetMapping("/record/{roomId}")
    public String recordPage(@PathVariable("roomId") Long roomId, Model model) {
        model.addAttribute("roomId : ", roomId);
        return "record";
    }
}
