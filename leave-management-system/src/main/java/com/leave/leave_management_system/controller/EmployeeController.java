package com.leave.leave_management_system.controller;

import com.leave.leave_management_system.entity.Employee;
import com.leave.leave_management_system.service.EmployeeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/employee")
@CrossOrigin("*")
public class EmployeeController {

    @Autowired
    EmployeeService service;

    @PostMapping("/register")
    public Employee register(@RequestBody Employee employee){
        return service.save(employee);
    }

    @PostMapping("/login")
    public Employee login(@RequestBody Employee employee){

        System.out.println("=================================");
        System.out.println("Email Received : " + employee.getEmail());
        System.out.println("Password Received : " + employee.getPassword());
        System.out.println("=================================");

        Employee loggedIn = service.login(employee.getEmail(), employee.getPassword());

        System.out.println("Login Result : " + loggedIn);

        return loggedIn;
    }
}