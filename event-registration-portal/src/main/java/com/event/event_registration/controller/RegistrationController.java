package com.event.event_registration.controller;

import com.event.event_registration.entity.Registration;
import com.event.event_registration.service.RegistrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/registrations")
public class RegistrationController {

    @Autowired
    private RegistrationService service;

    // CREATE REGISTRATION
    @PostMapping
    public Registration register(@RequestBody Registration registration) {
        return service.register(registration);
    }

    // GET ALL REGISTRATIONS
    @GetMapping
    public List<Registration> getAll() {
        return service.getAllRegistrations();
    }

    // GET BY EVENT ID
    @GetMapping("/event/{eventId}")
    public List<Registration> getByEvent(@PathVariable Integer eventId) {
        return service.getByEventId(eventId);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Registration getById(@PathVariable Integer id) {
        return service.getRegistrationById(id).orElse(null);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Integer id) {
        service.deleteRegistration(id);
    }
}