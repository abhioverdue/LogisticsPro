# LogisticsPro - Logistics Management System

A full-stack logistics management system built with Spring Boot and Vanilla JavaScript. Provides comprehensive order tracking, role-based authentication, and dashboard functionality for buyers, sellers, and couriers.



## Features

### Authentication & Authorization
- JWT-based authentication with BCrypt password hashing
- Role-based access control (Buyer, Seller, Courier)
- Secure token management and session handling
- User registration

### Order Tracking
- Real-time order tracking with status timeline
- Public tracking interface (no login required)
- Interactive OpenStreetMap integration with Leaflet.js
- Route visualization between pickup and delivery locations
- Distance calculation and estimated delivery times

### Dashboards
- Role-specific dashboards for each user type
- Order management and statistics
- Real-time data updates
- Responsive design for mobile and desktop

## Technology Stack

**Backend**
- Spring Boot 3.2.0 (Java 21)
- Spring Security with JWT
- MongoDB for data persistence
- Maven for dependency management

**Frontend**
- Vanilla JavaScript (ES6+)
- HTML5 & CSS3 with CSS Variables
- Leaflet.js for mapping
- Responsive design with Flexbox/Grid

**Database**
- MongoDB with collections for Users, Orders, and Roles


## Quick Start

### Prerequisites
- Java 21 or higher
- Maven 3.6+
- MongoDB 4.4+ running on localhost:27017
- Git

### Installation

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd logistics-management-system
```

2. **Start MongoDB**
```bash
# Windows
mongod --dbpath "C:\data\db"

# Linux/Mac
sudo systemctl start mongod
```

3. **Configure application**

Edit `backend/src/main/resources/application.yml`:
```yaml
spring:
  data:
    mongodb:
      uri: mongodb://localhost:27017/logistics_db

app:
  jwtSecret: mySecretLogisticsKey2025ThisIsAVeryLongSecretKeyForJWTThatIs256BitsLongToEnsureSecurityAndCompliance
  jwtExpirationMs: 86400000  # 24 hours
```

4. **Build and run**
```bash
cd backend
mvn clean package -DskipTests
java -jar target/logistics-management-system-1.0.0.jar
```

5. **Access the application**
- Homepage: http://localhost:8080
- Login: http://localhost:8080/login.html
- Demo tracking number: TRK-FTE12345

## Testing

### Test Credentials

**Seller Account**
- Email: seller@example.com
- Password: password123

**Buyer Account**
- Email: buyer@example.com
- Password: password123

**Courier Account**
- Email: courier@example.com
- Password: password123

### API Testing

**Authentication**
```bash
curl -X POST http://localhost:8080/api/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"seller@example.com","password":"password123"}'
```

**Order Tracking**
```bash
curl http://localhost:8080/api/tracking/public/TRK-FTE12345
```


## Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Create Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.




