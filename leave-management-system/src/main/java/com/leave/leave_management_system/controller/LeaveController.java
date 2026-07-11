package com.leave.leave_management_system.controller;

import com.leave.leave_management_system.entity.LeaveRequest;
import com.leave.leave_management_system.service.LeaveService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/leave")
@CrossOrigin("*")
public class LeaveController {

    @Autowired
    LeaveService service;

    @PostMapping("/apply")
    public LeaveRequest apply(@RequestBody LeaveRequest leave) {
        return service.applyLeave(leave);
    }

    @GetMapping("/employee/{id}")
    public List<LeaveRequest> history(@PathVariable Long id) {
        return service.getEmployeeLeaves(id);
    }

    @GetMapping("/all")
    public List<LeaveRequest> getAll() {
        return service.getAllLeaves();
    }

    @PutMapping("/approve/{id}")
    public LeaveRequest approve(@PathVariable Long id) {
        return service.approveLeave(id);
    }

    @PutMapping("/reject/{id}")
    public LeaveRequest reject(@PathVariable Long id) {
        return service.rejectLeave(id);
    }

}