package com.leave.leave_management_system.service;

import com.leave.leave_management_system.entity.LeaveRequest;
import com.leave.leave_management_system.repository.LeaveRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class LeaveService {

    @Autowired
    LeaveRepository repository;

    public LeaveRequest applyLeave(LeaveRequest leave) {
        leave.setStatus("Pending");
        return repository.save(leave);
    }

    public List<LeaveRequest> getEmployeeLeaves(Long employeeId) {
        return repository.findByEmployeeId(employeeId);
    }

    public List<LeaveRequest> getAllLeaves() {
        return repository.findAll();
    }

    public LeaveRequest approveLeave(Long id) {

        LeaveRequest leave = repository.findById(id).orElse(null);

        if (leave != null) {
            leave.setStatus("Approved");
            return repository.save(leave);
        }

        return null;
    }

    public LeaveRequest rejectLeave(Long id) {

        LeaveRequest leave = repository.findById(id).orElse(null);

        if (leave != null) {
            leave.setStatus("Rejected");
            return repository.save(leave);
        }

        return null;
    }

}

