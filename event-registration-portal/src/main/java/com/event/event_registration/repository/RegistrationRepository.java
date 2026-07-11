package com.event.event_registration.repository;

import com.event.event_registration.entity.Registration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationRepository extends JpaRepository<Registration, Integer> {

    List<Registration> findByEvent_EventId(Integer eventId);
}