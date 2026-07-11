# Leaf Portal - Backend REST API

This directory contains the Spring Boot backend for the **Leaf Portal**. It provides REST APIs for employee authentication, leave management, and database operations. The backend communicates with a MySQL database and serves data to the frontend application.

---

## 🛠️ Tech Stack

* **Language:** Java 17+
* **Framework:** Spring Boot 3.x
* **Persistence:** Spring Data JPA & Hibernate
* **Database:** MySQL 8.x
* **Build Tool:** Apache Maven

---

## 📌 Base URL

All API endpoints use JSON (`application/json`) and are available at:

```text
http://localhost:8080
```

---

## 🚀 API Endpoints

### Employee APIs (`/employee`)

| Method | Endpoint             | Description                                        |
| ------ | -------------------- | -------------------------------------------------- |
| POST   | `/employee/register` | Register a new employee account.                   |
| POST   | `/employee/login`    | Authenticate an employee and return their details. |

### Leave APIs (`/leave`)

| Method | Endpoint               | Description                                          |
| ------ | ---------------------- | ---------------------------------------------------- |
| POST   | `/leave/apply`         | Submit a new leave request.                          |
| GET    | `/leave/employee/{id}` | Retrieve all leave requests for a specific employee. |
| GET    | `/leave/all`           | Retrieve all leave requests (Admin).                 |
| PUT    | `/leave/approve/{id}`  | Approve a leave request.                             |
| PUT    | `/leave/reject/{id}`   | Reject a leave request.                              |

---

## ⚙️ Database Configuration

### 1. Create the Database

Run the following command in MySQL:

```sql
CREATE DATABASE leave_management;
```

### 2. Configure Database Credentials

Update the database configuration in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/leave_management
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

---

## ▶️ Running the Backend

### Using Maven Wrapper

Windows:

```bash
mvnw.cmd spring-boot:run
```

Linux/macOS:

```bash
./mvnw spring-boot:run
```

Or build the project:

```bash
mvn clean install
```

Then run:

```bash
java -jar target/*.jar
```

The backend will start on:

```text
http://localhost:8080
```

---

## 📁 Project Structure

```text
backend/
├── src/
│   ├── main/
│   │   ├── java/
│   │   │   ├── controller/
│   │   │   ├── service/
│   │   │   ├── repository/
│   │   │   ├── model/
│   │   │   └── config/
│   │   └── resources/
│   │       └── application.properties
├── pom.xml
└── README.md
```

---

## 📝 Features

* Employee registration and login
* Leave application management
* Leave approval and rejection
* MySQL database integration
* RESTful API architecture
* Spring Boot & JPA-based backend
