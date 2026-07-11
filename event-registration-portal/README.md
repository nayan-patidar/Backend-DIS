# Event Portal & Registration System

A full-stack web application designed to manage events and coordinate participant registrations. Built with a robust **Spring Boot (Java)** REST API on the backend and a high-performance **Angular** SPA on the frontend, using a local **MySQL** database.

---

## 🌟 Features

### 📊 Admin Dashboard
* **Real-time Statistics**: View total event counts, total user registrations, and active users at a glance.
* **Upcoming Events Feed**: Interactive timeline displaying upcoming events sorted by date, with progress bars showing capacity utilization.

### 📅 Event Management
* **Interactive Catalog**: Clean list of events with details like date, time, venue, and description.
* **Event Creation Form**: Dedicated screen for admins to design and post new events with specific target capacities.
* **Delete Functionality**: Capability to instantly remove events and cascade changes.

### 👥 Participant Registration
* **Flexible Registration Workflow**:
  * **Existing User**: Select an already registered user from a searchable dropdown.
  * **New User**: Create a new participant account directly inside the registration form in a single step (with real-time password length validation and email checks).
* **Live Validation**: Immediate visual alerts (invalid inputs, missing event, password lengths).

### 📋 Registrations List
* **Central Directory**: View all registered records with participant details (name, email) and the event they signed up for.
* **Filters & Search**: Instantly filter registrations by status (`Registered`, `Cancelled`) or search by event name, participant name, or email.
* **Cancel & Delete Actions**: Mark registrations as cancelled or remove records permanently from the database.

---

## 🛠️ Technology Stack

| Layer | Technology | Version / Key Details |
| :--- | :--- | :--- |
| **Frontend** | Angular | v21.2+ (Standalone Components, Routing, FormBuilder) |
| **Styling** | Bootstrap | v5.3 (Responsive Grid, Cards, Flexbox) |
| **Icons** | Bootstrap Icons | v1.13 |
| **Backend** | Spring Boot | Java 17+, Maven |
| **ORM** | Spring Data JPA | Hibernate (auto-schema updates) |
| **Database** | MySQL | v8.0+ |

---

## 🚀 Setup & Installation Steps

### 1. Prerequisites
Ensure the following are installed on your machine:
* **Java Development Kit (JDK)**: v17 or higher
* **Node.js**: v18+ (includes npm)
* **MySQL Server**: v8.0+

---

### 2. Database Configuration
1. Open your MySQL client (CLI or Workbench) and create the database schema:
   sql
   CREATE DATABASE event_registration_portal;
   ```
2. Locate the database connection file in the backend source code:
   `src/main/resources/application.properties`
3. Configure the connection URL, username, and password:
   properties
   spring.datasource.url=jdbc:mysql://localhost:3306/event_registration_portal
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   

---

### 3. Backend Setup (Spring Boot)
1. Open a terminal in the backend directory:
   `C:\Users\Hp\Downloads\event-registration\event-registration`
2. Compile and run the Spring Boot server:
   ```bash
   ./mvnw spring-boot:run
   ```
3. The backend API server will start on **`http://localhost:8080`**.

---

### 4. Frontend Setup (Angular)
1. Open a terminal in the frontend directory:
   `C:\Users\Hp\.gemini\antigravity\scratch\event-registration-frontend`
2. Install the node dependencies:
   ```bash
   npm install
   ```
3. Run the development server (configured to bind to local loopback to avoid DNS latencies):
   ```bash
   npm start
   ```
4. Open your browser and navigate to:
   👉 **`http://127.0.0.1:4300`**

---

## 📂 Source Code Directory Structure

### Frontend Structure
* `src/app/components/` — Standalone UI Views (`dashboard`, `event-list`, `event-create`, `register-participant`, `participant-list`).
* `src/app/services/` — Network endpoints connecting to backend (`event.service.ts`, `user.service.ts`, `registration.service.ts`).
* `src/app/models/` — Type models and database mapping enums (`Role`, `Status`).
* `src/app/app.routes.ts` — SPA routing endpoints.

### Backend Structure
* `src/main/java/com/event/event_registration/controller/` — REST API endpoints for JSON exchange.
* `src/main/java/com/event/event_registration/entity/` — Table schema declarations (`User.java` ➡️ `users`, `Event.java` ➡️ `events`, `Registration.java` ➡️ `registrations`).
* `src/main/java/com/event/event_registration/repository/` — JPA repository classes for database operations.
