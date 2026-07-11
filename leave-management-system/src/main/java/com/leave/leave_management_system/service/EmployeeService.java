package com.leave.leave_management_system.service;

import com.leave.leave_management_system.entity.Employee;
import com.leave.leave_management_system.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class EmployeeService {

    @Autowired
    EmployeeRepository repository;

    public Employee save(Employee employee){
        return repository.save(employee);
    }

    public Employee login(String email,String password){

        Employee employee=repository.findByEmail(email);

        if(employee!=null && employee.getPassword().equals(password))
            return employee;

        return null;
    }

}