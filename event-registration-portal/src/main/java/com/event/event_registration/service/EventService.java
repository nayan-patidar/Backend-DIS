package com.event.event_registration.service;

import com.event.event_registration.entity.Event;
import com.event.event_registration.entity.User;
import com.event.event_registration.repository.EventRepository;
import com.event.event_registration.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private UserRepository userRepository;

    public Event saveEvent(Event event) {

        Integer userId = event.getCreatedBy().getUserId();

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        event.setCreatedBy(user);

        return eventRepository.save(event);
    }

    public List<Event> getAllEvents() {
        return eventRepository.findAll();
    }

    public Optional<Event> getEventById(Integer id) {
        return eventRepository.findById(id);
    }

    public void deleteEvent(Integer id) {
        eventRepository.deleteById(id);
    }
}