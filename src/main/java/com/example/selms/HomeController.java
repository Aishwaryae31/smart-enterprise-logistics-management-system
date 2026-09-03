package com.example.selms;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.util.*;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home(Model model) {

        Map<String, Integer> stats = new HashMap<>();
        stats.put("totalOrders", 10);
        stats.put("pendingOrders", 4);
        stats.put("deliveredOrders", 5);
        stats.put("failedOrders", 1);

        List<String> products = Arrays.asList("Laptop", "Phone", "Tablet", "Headphones");

        model.addAttribute("stats", stats);
        model.addAttribute("products", products);
        model.addAttribute("customers", new ArrayList<>());

        return "index";
    }
}