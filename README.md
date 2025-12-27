<p align="center">
  <img src="https://cdn.owls.asia/static/logo.png" alt="OWLS Logo" width="120" height="120" />
</p>

<h1 align="center">OWLS</h1>

<p align="center">
  <strong>Premium E-Commerce Platform</strong><br>
  A modern, full-stack e-commerce application built with Next.js 16 and Django 5
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Structure</a> •
  <a href="#api-documentation">API Docs</a> •
  <a href="#deployment">Deployment</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16.1.1-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19.2-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Django-5.2-092E20?style=for-the-badge&logo=django" alt="Django" />
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
</p>

---

## ✨ Features

### 🛍️ Shopping Experience
- **Product Catalog** — Browse products by category with advanced filtering
- **Product Details** — Rich product pages with image galleries and specifications
- **Shopping Cart** — Real-time cart management with stock validation
- **Wishlist** — Save favorite products for later

### 💳 Payments & Checkout
- **Multiple Payment Methods**
  - 💵 Cash on Delivery (COD)
  - 🏦 VNPay (Banking & QR)
  - 📱 MoMo E-Wallet
- **Secure Checkout** — Form validation and order confirmation
- **Order Tracking** — Real-time status updates

### 👤 User Management
- **JWT Authentication** — Secure access & refresh tokens
- **User Profiles** — Address management and order history
- **Email Verification** — Account security with email confirmation

### 🎨 Design System
- **Ethereal Aurora & Glassmorphism** — Premium dark theme with animated backgrounds
- **Responsive Design** — Optimized for mobile, tablet, and desktop
- **Smooth Animations** — Powered by Framer Motion
- **Accessibility** — WCAG compliant components

### 🔧 Admin & Management
- **Admin Dashboard** — Custom Next.js admin interface
- **Django Admin** — Full content management system
- **Product Management** — Categories, inventory, pricing
- **Order Management** — Status updates, cancellation, refunds
- **Analytics Ready** — Structured for tracking implementation

---

## 🛠️ Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.1.1 | React framework with App Router |
| **React** | 19.2 | UI library with React Compiler |
| **TypeScript** | 5.x | Type safety |
| **Tailwind CSS** | 4.0 | Utility-first styling |
| **Zustand** | 5.x | State management |
| **Framer Motion** | 12.x | Animations |
| **React Hook Form** | 7.x | Form handling |
| **Zod** | 4.x | Schema validation |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| **Django** | 5.2 | Web framework |
| **Django REST Framework** | 3.x | API endpoints |
| **PostgreSQL** | 15+ | Database |
| **Redis** | 7+ | Caching & sessions |
| **Celery** | 5.x | Async task queue |
| **Cloudflare R2** | - | Media storage (S3-compatible) |
| **SimpleJWT** | - | JWT authentication |

### Payments
| Provider | Type | Status |
|----------|------|--------|
| **VNPay** | Banking/QR | ✅ Active |
| **MoMo** | E-Wallet | ✅ Active |
| **COD** | Cash on Delivery | ✅ Active |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 20+ and npm/yarn/pnpm
- **Python** 3.12+
- **PostgreSQL** 15+ (or SQLite for development)
- **Redis** 7+ (optional, for caching)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/yourusername/owls.git
cd owls
```

#### 2. Backend Setup

```bash
# Create virtual environment
cd backend
python -m venv ../.venv
../.venv/Scripts/activate  # Windows
# source ../.venv/bin/activate  # Linux/Mac

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your settings

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Seed sample data (optional)
python manage.py seed_products

# Start development server
python manage.py runserver
```

#### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your settings

# Start development server
npm run dev
```

#### 4. Access the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Admin Dashboard**: http://localhost:3000/admin
- **Django Admin**: http://localhost:8000/admin/
- **API Docs**: http://localhost:8000/api/docs/

---

## 📁 Project Structure

```
owls/
├── backend/                    # Django backend
│   ├── apps/
│   │   ├── identity/          # Authentication, profiles & 2FA
│   │   ├── catalog/           # Product catalog & categories
│   │   ├── sales/             # Cart, orders & checkout
│   │   ├── payments/          # VNPay, MoMo integration
│   │   └── shipping/          # GHN shipping integration
│   ├── backend/               # Django settings
│   └── manage.py
│
├── frontend/                   # Next.js frontend
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── admin/         # Admin dashboard
│   │   │   ├── account/       # User account pages
│   │   │   ├── products/      # Product listing & details
│   │   │   ├── cart/          # Shopping cart
│   │   │   └── checkout/      # Checkout flow
│   │   ├── components/        # React components
│   │   │   ├── ui/            # Base UI (shadcn/ui)
│   │   │   └── layout/        # Header, Footer, etc.
│   │   ├── lib/               # API client & utilities
│   │   ├── store/             # Zustand stores
│   │   └── types/             # TypeScript types
│   ├── public/                # Static assets
│   └── package.json
│
└── README.md
```

---

## 🔌 API Documentation

### Authentication (Identity)

```http
POST /api/auth/register/         # Register new user
POST /api/auth/login/            # Login & get tokens
POST /api/auth/token/refresh/    # Refresh access token
POST /api/auth/logout/           # Logout & blacklist token
GET  /api/auth/me/               # Get current user
PUT  /api/auth/me/               # Update profile
POST /api/auth/2fa/setup/        # Setup 2FA
POST /api/auth/2fa/verify/       # Verify 2FA code
```

### Catalog

```http
GET  /api/catalog/products/      # List products (filterable)
GET  /api/catalog/products/:slug/ # Product details
GET  /api/catalog/categories/    # List categories
GET  /api/catalog/filters/       # Get available filters
```

### Sales (Cart & Orders)

```http
GET  /api/sales/cart/            # Get cart
POST /api/sales/cart/add/        # Add item to cart
POST /api/sales/cart/update/     # Update item quantity
POST /api/sales/cart/remove/     # Remove item
POST /api/sales/cart/clear/      # Clear cart
POST /api/sales/checkout/        # Create order
GET  /api/sales/orders/          # List user orders
GET  /api/sales/orders/:number/  # Order details
POST /api/sales/orders/:number/cancel/ # Cancel order
```

### Payments

```http
GET  /api/payments/vnpay/return/   # VNPay callback
POST /api/payments/momo/webhook/   # MoMo IPN
```

### Shipping (GHN)

```http
GET  /api/shipping/provinces/      # Get provinces
GET  /api/shipping/districts/      # Get districts by province
GET  /api/shipping/wards/          # Get wards by district
POST /api/shipping/calculate-fee/  # Calculate shipping fee
```

> 📖 Full API documentation available at `/api/docs/` (Swagger UI)

---

## ⚙️ Environment Variables

### Backend (.env)

```env
# Django
DJANGO_SECRET_KEY=your-secret-key
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=127.0.0.1,localhost

# Database
DATABASE_URL=postgres://user:pass@localhost:5432/owls

# Storage (Cloudflare R2)
USE_R2=True
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_STORAGE_BUCKET_NAME=your-bucket
AWS_S3_ENDPOINT_URL=https://xxx.r2.cloudflarestorage.com
AWS_S3_CUSTOM_DOMAIN=cdn.yourdomain.com

# VNPay
VNPAY_TMN_CODE=your-tmn-code
VNPAY_HASH_SECRET=your-hash-secret
VNPAY_PAYMENT_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

# MoMo
MOMO_PARTNER_CODE=your-partner-code
MOMO_ACCESS_KEY=your-access-key
MOMO_SECRET_KEY=your-secret-key
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🚢 Deployment

### Docker (Recommended)

```bash
# Build and run all services
docker-compose up -d

# Run migrations
docker-compose exec backend python manage.py migrate
```

### Manual Deployment

1. **Backend**: Deploy Django with Gunicorn + Nginx
2. **Frontend**: Deploy to Vercel or build with `npm run build`
3. **Database**: Use managed PostgreSQL (Supabase, Neon, etc.)
4. **Storage**: Cloudflare R2 for media files

---

## 📝 Development

### Code Style

- **Python**: Follow PEP 8, use Black formatter
- **TypeScript**: ESLint + Prettier
- **Git**: Conventional Commits

### Testing

```bash
# Backend tests
cd backend
python manage.py test

# Frontend tests
cd frontend
npm run test
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👥 Contributors

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/kumaruseru">
        <strong>Trọng Nghĩa</strong>
      </a>
      <br />
      <sub>Lead Developer</sub>
    </td>
  </tr>
</table>

---

<p align="center">
  Made with ❤️ by OWLS Team
</p>
