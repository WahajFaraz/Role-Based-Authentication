# User Management System API

A complete User Management System backend built with Node.js, Express.js, MongoDB, and Mongoose. This API implements full CRUD operations with Basic Authentication and follows RESTful conventions.

## 🚀 Features

- **RESTful API** following best practices
- **Full CRUD Operations** for user management
- **Basic Authentication** for secure endpoint protection
- **MongoDB** with Mongoose ODM
- **Password Hashing** with bcrypt
- **Error Handling** with custom error classes
- **Input Validation** and sanitization
- **Pagination** for user listing
- **Environment Variables** for configuration
- **Production Ready** with proper logging and security

## 📋 Requirements

- Node.js >= 14.0.0
- MongoDB >= 4.0
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd user-management-system
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/user-management-system
   BASIC_AUTH_USERNAME=admin
   BASIC_AUTH_PASSWORD=admin123
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system:
   ```bash
   # For MongoDB installed locally
   mongod
   ```

5. **Run the application**
   ```bash
   # Development mode with nodemon
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Base URL
```
http://localhost:5000
```

### Authentication

All endpoints except `POST /api/users` require **Basic Authentication**.

**How to authenticate:**
- Add an `Authorization` header to your request
- Format: `Basic <base64(email:password)>`
- Example: `Basic YWRtaW5AZXhhbXBsZS5jb206cGFzc3dvcmQxMjM=`

**In Postman:**
1. Go to Authorization tab
2. Select "Basic Auth"
3. Enter email as username and password as password

### Endpoints

#### 1. Create User (Public)
```http
POST /api/users
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

#### 2. Get All Users (Protected)
```http
GET /api/users
Authorization: Basic <base64(email:password)>

# Query Parameters (Optional)
GET /api/users?page=1&limit=10
```

#### 3. Get User by ID (Protected)
```http
GET /api/users/:id
Authorization: Basic <base64(email:password)>
```

#### 4. Update User (Protected)
```http
PUT /api/users/:id
Authorization: Basic <base64(email:password)>
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com"
}
```

#### 5. Delete User (Protected)
```http
DELETE /api/users/:id
Authorization: Basic <base64(email:password)>
```

#### 6. Get Profile (Protected)
```http
GET /api/users/profile
Authorization: Basic <base64(email:password)>
```

#### 7. Health Check
```http
GET /health
```

## 📄 Postman Collection

### Import the following requests into Postman:

#### 1. Create User
- **Method:** POST
- **URL:** `http://localhost:5000/api/users`
- **Headers:** `Content-Type: application/json`
- **Body (raw JSON):**
  ```json
  {
    "name": "Alice Johnson",
    "email": "alice@example.com",
    "password": "alice123"
  }
  ```

#### 2. Get All Users
- **Method:** GET
- **URL:** `http://localhost:5000/api/users`
- **Authorization:** Basic Auth
  - Username: `alice@example.com`
  - Password: `alice123`

#### 3. Get User by ID
- **Method:** GET
- **URL:** `http://localhost:5000/api/users/USER_ID_HERE`
- **Authorization:** Basic Auth (same as above)

#### 4. Update User
- **Method:** PUT
- **URL:** `http://localhost:5000/api/users/USER_ID_HERE`
- **Authorization:** Basic Auth (same as above)
- **Body (raw JSON):**
  ```json
  {
    "name": "Alice Updated",
    "email": "alice.updated@example.com"
  }
  ```

#### 5. Delete User
- **Method:** DELETE
- **URL:** `http://localhost:5000/api/users/USER_ID_HERE`
- **Authorization:** Basic Auth (same as above)

#### 6. Get Profile
- **Method:** GET
- **URL:** `http://localhost:5000/api/users/profile`
- **Authorization:** Basic Auth (same as above)

## 📁 Project Structure

```
user-management-system/
├── controllers/
│   └── userController.js      # User business logic
├── middleware/
│   ├── auth.js               # Basic authentication middleware
│   └── errorHandler.js        # Global error handling
├── models/
│   └── User.js               # User schema and model
├── routes/
│   └── userRoutes.js         # User API routes
├── utils/
│   └── database.js           # Database connection utilities
├── .env                      # Environment variables
├── .gitignore               # Git ignore file
├── app.js                   # Main application file
├── package.json             # Dependencies and scripts
└── README.md                # This file
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment mode | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/user-management-system |
| `BASIC_AUTH_USERNAME` | Basic auth username (demo) | admin |
| `BASIC_AUTH_PASSWORD` | Basic auth password (demo) | admin123 |

### Database Schema

**User Model:**
```javascript
{
  name: String (required, 2-50 chars),
  email: String (required, unique, valid email),
  password: String (required, 6+ chars, hashed),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

## 🛡️ Security Features

- **Password Hashing:** All passwords are hashed using bcrypt with salt rounds of 12
- **Input Validation:** Comprehensive validation for all input fields
- **Authentication:** Basic Authentication for all protected endpoints
- **Error Handling:** Sanitized error responses in production
- **CORS:** Configurable CORS policy
- **Rate Limiting:** Can be easily added with express-rate-limit
- **Helmet:** Security headers can be added with helmet middleware

## 🧪 Testing

The API is fully testable with Postman or any HTTP client. Follow these steps:

1. **Create a test user** using the POST /api/users endpoint
2. **Use the created user's credentials** for Basic Authentication
3. **Test all CRUD operations** with proper authentication headers
4. **Test error scenarios** like invalid IDs, missing fields, etc.

## 📝 Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "type": "ValidationError",
    "statusCode": 400
  }
}
```

## 🚀 Deployment

### Production Setup

1. **Set environment variables:**
   ```env
   NODE_ENV=production
   MONGODB_URI=mongodb://your-production-db
   PORT=8080
   ```

2. **Install PM2 for process management:**
   ```bash
   npm install -g pm2
   pm2 start app.js --name "user-management-api"
   ```

3. **Set up reverse proxy** (nginx example):
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com;
       
       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error:**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Verify network connectivity

2. **Authentication Failed:**
   - Check Authorization header format
   - Verify email and password are correct
   - Ensure user exists in database

3. **Validation Errors:**
   - Check required fields in request body
   - Verify email format is valid
   - Ensure password meets minimum length requirements

4. **Port Already in Use:**
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:5000 | xargs kill`

## 📞 Support

For support and questions, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using Node.js, Express, MongoDB, and Mongoose**
