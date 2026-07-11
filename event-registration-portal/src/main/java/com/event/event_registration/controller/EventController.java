package com.event.event_registration.controller;

import com.event.event_registration.entity.Event;
import com.event.event_registration.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/events")
public class EventController {

    @Autowired
    private EventService eventService;

    @PostMapping
    public Event createEvent(@RequestBody Event event) {

        System.out.println("Event Name = " + event.getEventName());
        System.out.println("Capacity = " + event.getCapacity());
        System.out.println("Venue = " + event.getVenue());

        return eventService.saveEvent(event);
    }

    @GetMapping
    public List<Event> getAllEvents() {
        return eventService.getAllEvents();
    }

    @GetMapping("/{id}")
    public Event getEvent(@PathVariable Integer id) {
        return eventService.getEventById(id).orElse(null);
    }

    @DeleteMapping("/{id}")
    public String deleteEvent(@PathVariable Integer id) {
        eventService.deleteEvent(id);
        return "Event Deleted Successfully";
    }
}