# Backend API - مرکز تحقیقات اپتوالکترونیک

A Node.js + Express + PostgreSQL backend API with phone-based OTP authentication.

## 📋 Requirements

- Node.js 18+
- PostgreSQL 14+
- Ubuntu 20.04+ (for VPS deployment)

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Setup PostgreSQL

```bash
# Create database
sudo -u postgres createdb optoelectronic_db

# Or via psql
sudo -u postgres psql
CREATE DATABASE optoelectronic_db;
\q
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your settings
nano .env
```

### 4. Run Migrations

```bash
npm run migrate
```

### 5. Seed Default Data

```bash
npm run seed
```

### 6. Start Server

```bash
# Development
npm run dev

# Production
npm start
```

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/
│   │   └── database.js          # PostgreSQL connection
│   ├── controllers/
│   │   ├── auth.controller.js   # User authentication
│   │   ├── admin.controller.js  # Admin operations
│   │   ├── course.controller.js # Course CRUD
│   │   ├── gallery.controller.js
│   │   ├── schedule.controller.js
│   │   ├── settings.controller.js
│   │   └── user.controller.js
│   ├── database/
│   │   ├── migrations/          # SQL migrations
│   │   ├── migrate.js           # Migration runner
│   │   └── seed.js              # Seed data
│   ├── middleware/
│   │   ├── auth.middleware.js   # JWT verification
│   │   ├── upload.middleware.js # File uploads
│   │   └── validate.middleware.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── admin.routes.js
│   │   ├── course.routes.js
│   │   ├── gallery.routes.js
│   │   ├── schedule.routes.js
│   │   ├── settings.routes.js
│   │   └── user.routes.js
│   ├── services/
│   │   ├── jwt.service.js       # JWT generation/verification
│   │   ├── otp.service.js       # OTP generation/verification
│   │   └── sms.service.js       # SMS provider abstraction
│   └── index.js                 # Entry point
├── uploads/                     # Uploaded files
├── .env.example
├── package.json
└── README.md
```

## 🔐 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/request-otp` | Request OTP code |
| POST | `/api/auth/verify-otp` | Verify OTP & get token |
| GET | `/api/auth/me` | Get current user |
| POST | `/api/auth/logout` | Logout |

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/login` | Admin login (phone + password) |
| GET | `/api/admin/me` | Get admin info |
| PUT | `/api/admin/change-password` | Change password |
| GET | `/api/admin/users` | List all users |
| GET | `/api/admin/users/:id` | Get user by ID |
| PUT | `/api/admin/users/:id/status` | Activate/deactivate user |
| DELETE | `/api/admin/users/:id` | Delete user |
| GET | `/api/admin/stats` | Dashboard statistics |

### Courses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/courses` | List courses |
| GET | `/api/courses/:id` | Get course |
| POST | `/api/courses` | Create course (admin) |
| PUT | `/api/courses/:id` | Update course (admin) |
| DELETE | `/api/courses/:id` | Delete course (admin) |
| GET | `/api/courses/user/enrolled` | User's enrolled courses |
| GET | `/api/courses/user/cart` | User's cart |
| POST | `/api/courses/user/cart/:id` | Add to cart |
| DELETE | `/api/courses/user/cart/:id` | Remove from cart |
| POST | `/api/courses/user/enroll/:id` | Enroll (free courses) |

### Gallery
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gallery` | List images |
| GET | `/api/gallery/:id` | Get image |
| POST | `/api/gallery` | Upload image (admin) |
| PUT | `/api/gallery/:id` | Update image (admin) |
| DELETE | `/api/gallery/:id` | Delete image (admin) |

### Schedules
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/schedules` | List all schedules |
| GET | `/api/schedules/days` | Get unique days |
| GET | `/api/schedules/day/:num` | Get schedules by day |
| POST | `/api/schedules` | Create schedule (admin) |
| PUT | `/api/schedules/:id` | Update schedule (admin) |
| DELETE | `/api/schedules/:id` | Delete schedule (admin) |
| DELETE | `/api/schedules/day/:num` | Delete all for day (admin) |

### Settings
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings/site` | Get site settings |
| PUT | `/api/settings/site` | Update setting (admin) |
| PUT | `/api/settings/site/bulk` | Update multiple (admin) |
| POST | `/api/settings/site/upload` | Upload file (admin) |
| GET | `/api/settings/card` | Get card settings |
| PUT | `/api/settings/card` | Update card (admin) |
| DELETE | `/api/settings/card/image` | Delete card image (admin) |

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Server health status |

## 📱 SMS Provider Configuration

The SMS service is abstracted to support multiple Iranian providers. Configure in `.env`:

```env
SMS_PROVIDER=mock  # Options: mock, kavenegar, melipayamak, ghasedak, smsir
SMS_API_KEY=your_api_key
SMS_SENDER=your_sender_number
```

### Adding a New Provider

Edit `src/services/sms.service.js` and add your provider to the `providers` object.

## 🔒 Security Features

- JWT authentication with configurable expiry
- Password hashing with bcrypt (12 rounds)
- OTP hashing for secure storage
- Rate limiting on all endpoints
- Stricter rate limiting on OTP requests
- Helmet.js security headers
- CORS configuration
- Input validation with express-validator

## 🚀 Production Deployment (Ubuntu VPS)

### 1. Install Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### 2. Install PostgreSQL

```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl enable postgresql
```

### 3. Setup PM2

```bash
sudo npm install -g pm2
pm2 start src/index.js --name "optoelectronic-api"
pm2 startup
pm2 save
```

### 4. Setup Nginx (optional)

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 📝 License

Private - All rights reserved
