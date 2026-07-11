# Complaint Management Portal Backend

Spring Boot REST API for the Complaint Management Portal. It provides JWT authentication, role-based access control, complaint management, admin workflows, validation, Flyway migrations, and structured error responses.

## Overview

The backend implements:

- JWT-based authentication and authorization
- User registration and login
- Complaint creation and retrieval for authenticated users
- Admin-only complaint assignment and status update flows
- DTO validation using Jakarta Validation
- Global exception handling with standardized JSON error responses

## Setup

1. Install JDK 21 or newer.
2. Configure MySQL/MariaDB and create a database named `ComplaintManagement`, or let the configured JDBC URL create it.
3. Configure local environment variables as needed.
4. Run the application from this `backend` folder.

## Configuration

The application reads these environment variables, with development defaults defined in `src/main/resources/application.properties`:

| Variable | Purpose | Default |
| --- | --- | --- |
| `DB_URL` | JDBC database URL | `jdbc:mysql://localhost:3306/ComplaintManagement?createDatabaseIfNotExist=true` |
| `DB_USERNAME` | Database username | `root` |
| `DB_PASSWORD` | Database password | empty |
| `JWT_SECRET` | JWT signing secret, use a long random value | development-only default |
| `JWT_EXPIRATION_MS` | Token lifetime in milliseconds | `86400000` |
| `CORS_ALLOWED_ORIGINS` | Comma-separated frontend origins | localhost ports `4200` and `4300` |
| `SERVER_PORT` | Backend HTTP port | `8080` |
| `DEMO_DATA_ENABLED` | Create demo admin/user accounts on startup | `false` |
| `SPRING_SECURITY_LOG_LEVEL` | Spring Security log verbosity | `INFO` |

Example local setup:

```bash
export DB_PASSWORD='your-database-password'
export JWT_SECRET='replace-with-a-long-random-secret'
export CORS_ALLOWED_ORIGINS='http://localhost:4300,http://127.0.0.1:4300'
```

## Build and run

From the `backend` folder:

```bash
./gradlew build
./gradlew bootRun
```

The application starts on `http://localhost:8080`.

## API Endpoints

### Authentication

- `POST /api/auth/register`
  - Body example:
    ```json
    {
      "name": "Example User",
      "email": "user@example.com",
      "password": "StrongPass123"
    }
    ```

- `POST /api/auth/login`
  - Body example:
    ```json
    {
      "email": "user@example.com",
      "password": "StrongPass123"
    }
    ```
  - Returns a JWT token.

### Complaints

- `POST /api/complaints`
  - Requires `Authorization: Bearer <token>`
  - Body example:
    ```json
    {
      "title": "Issue with login",
      "description": "I cannot log in to the portal.",
      "category": "Support",
      "priority": "High"
    }
    ```

- `GET /api/complaints`
  - Requires `Authorization: Bearer <token>`
  - Returns complaints created by the authenticated user.

- `GET /api/complaints/{id}`
  - Requires `Authorization: Bearer <token>`
  - Returns a single complaint if the user is the creator, assignee, or admin.

### Admin-only endpoints

- `PUT /api/admin/complaints/{id}/status`
  - Requires an admin token.
  - Body example:
    ```json
    {
      "status": "RESOLVED"
    }
    ```

- `PUT /api/admin/complaints/{id}/assign`
  - Requires an admin token.
  - Assigns the complaint to the authenticated admin user.

## Security and validation

- User registration and login requests are validated with `@Valid`.
- The JWT token is required for protected endpoints.
- Admin endpoints are protected by role checks.
- API errors return standardized JSON responses via `@RestControllerAdvice`.

## Test cases

The backend test files are:

- `src/test/java/com/Internship/Complaint_Management_Portal/ComplaintManagementPortalApplicationTests.java`
- `src/test/java/com/Internship/Complaint_Management_Portal/integration/SecurityIntegrationTests.java`

## How to run tests

From the `backend` folder:

```bash
./gradlew test
```

To run the existing context load test only:

```bash
./gradlew test --tests '*ComplaintManagementPortalApplicationTests'
```

To compile without running tests:

```bash
./gradlew compileJava
```

## Notes

- Make sure the database is available before running the application.
- Use a secure `JWT_SECRET` and avoid committing real credentials.
- Self-registration only creates regular users. Create admins manually in the database, or start locally with `DEMO_DATA_ENABLED=true` to create demo accounts.
