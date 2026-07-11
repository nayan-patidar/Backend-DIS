package com.Internship.Complaint_Management_Portal.repository;

import com.Internship.Complaint_Management_Portal.model.Complaint;
import com.Internship.Complaint_Management_Portal.model.Status;
import com.Internship.Complaint_Management_Portal.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ComplaintRepository extends JpaRepository<Complaint, Long>, JpaSpecificationExecutor<Complaint> {
    List<Complaint> findByCreatedBy(User user);
    List<Complaint> findByAssignedTo(User admin);
    List<Complaint> findByStatus(Status status);
    Page<Complaint> findByCreatedBy(User user, Pageable pageable);
}
