# 📋 Orders Microservice - NestJS

This is the **Orders** microservice built with [NestJS](https://nestjs.com/).  
It is part of a microservices architecture and handles the complete order lifecycle including creation, status management, payment processing, and order fulfillment.

---

> ⚠️ **Important Notes:**  
> - This microservice communicates exclusively using **NATS** messaging patterns.
> - Uses **PostgreSQL database** (Neon Cloud) for data persistence.
> - Integrates with **Products** and **Payments** microservices for complete order processing.
> - Handles payment events and order status updates automatically.

---

## 📚 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#-environment-variables)
- [Database Setup](#-database-setup)
- [Running with Docker](#-running-with-docker)
- [NATS Message Patterns](#-nats-message-patterns)
- [Order Lifecycle](#-order-lifecycle)
- [Payment Integration](#-payment-integration)
- [Additional Notes](#-additional-notes)
- [License](#-license)

---

## 🚀 Features

- **Complete Order Management** - Create, retrieve, update, and track orders
- **Product Validation** - Validates product existence and availability before order creation
- **Payment Integration** - Creates payment sessions and handles payment webhooks
- **Order Status Tracking** - Full lifecycle management (PENDING → PAID → DELIVERED/CANCELLED)
- **Pagination Support** - Efficient order listing with pagination
- **Order Filtering** - Filter orders by status
- **PostgreSQL Integration** - Robust database with Prisma ORM
- **NATS Communication** - Seamless microservice integration
- **Event-Driven Architecture** - Handles payment success events automatically

---

## 🛠️ Tech Stack

| Technology | Description                                |
|------------|--------------------------------------------|
| NestJS     | Backend framework for Node.js              |
| TypeScript | Main language of the project               |
| Prisma     | Database ORM and query builder             |
| PostgreSQL | Cloud database (Neon)                     |
| NATS       | Message broker for microservice messaging  |
| Class Validator | DTO validation and transformation     |
| RxJS       | Reactive programming for async operations   |

---

## 📁 Project Structure

```
src/
├── orders/             # Core order logic and business operations
│   ├── dto/            # Data Transfer Objects for validation
│   ├── enum/           # Order status enumerations
│   └── interfaces/     # Order-related interfaces
├── transports/         # NATS module configuration
├── common/             # Shared utilities and pagination DTOs
├── config/             # Environment config and validation
├── main.ts             # Entry point of the application
prisma/
├── schema.prisma       # Database schema definition
└── migrations/         # Database migration files
```

---

## 📦 Installation

To run the microservice locally:

1. **Clone the repository**

```bash
git clone https://github.com/nest-microservices-nel/orders-ms.git
cd orders-ms
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

Create a `.env` file in the root directory with the following content:

```env
PORT=3000
DATABASE_URL=postgresql://neondb_owner:npg_jiNHvQdS85Xq@ep-empty-field-a4p8bwap-pooler.us-east-1.aws.neon.tech/ordersdb?sslmode=require
NATS_SERVERS=nats://nats-server:4222
```

4. **Run database migrations**

```bash
npx prisma migrate deploy
npx prisma generate
```

5. **Run in development mode**

```bash
npm run start:dev
```

---

## 🔐 Environment Variables

| Variable        | Description                                     | Example                    |
|----------------|-------------------------------------------------|----------------------------|
| `PORT`         | Port where the service will run                 | `3000`                     |
| `DATABASE_URL` | PostgreSQL connection string (Neon Cloud)       | `postgresql://user:pass@host/db` |
| `NATS_SERVERS` | NATS server URL for microservice communication  | `nats://nats-server:4222`  |

---

## 🗄️ Database Setup

This microservice uses **PostgreSQL** hosted on Neon Cloud with Prisma ORM:

### Development Setup
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# View database (optional)
npx prisma studio
```

### Production Setup
```bash
# Deploy migrations to production
npx prisma migrate deploy

# Generate Prisma client
npx prisma generate
```

### Database Schema
- **Orders** - Main order entity with totals and status
- **OrderItems** - Individual products in each order with quantities and prices
- **OrderReceipts** - Payment receipts and transaction records

---

## 🐳 Running with Docker

### Step 1: Build the Docker image

```bash
docker build -t orders-ms .
```

### Step 2: Run the container

```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e DATABASE_URL=postgresql://neondb_owner:npg_jiNHvQdS85Xq@ep-empty-field-a4p8bwap-pooler.us-east-1.aws.neon.tech/ordersdb?sslmode=require \
  -e NATS_SERVERS=nats://nats-server:4222 \
  orders-ms
```

### Step 3: Production Build

```bash
docker build -f dockerfile.prod \
  --build-arg ORDERS_DATABASE_URL_BUILD=your_production_db_url \
  -t orders-ms-prod .
```

---

## 📡 NATS Message Patterns

These are the **NATS message patterns** handled by the microservice:

### Message Patterns (Request-Response)
| Pattern                | Description                           | Input                      | Output                |
|------------------------|---------------------------------------|----------------------------|-----------------------|
| `createOrder`          | Creates a new order with payment      | `CreateOrderDto`           | Payment session data  |
| `findAllOrders`        | Retrieves paginated list of orders    | `PaginationDto`            | Orders with metadata  |
| `findOneOrder`         | Retrieves a single order by ID        | `string` (UUID)            | Order with items      |
| `changeOrderStatus`    | Updates order status                  | `ChangeStatusOrderDto`     | Updated order         |
| `findAllByStatus`      | Filters orders by status             | `FindOrderByStatusDto`     | Filtered orders       |

### Event Patterns (Fire-and-Forget)
| Event Pattern          | Description                           | Input                      |
|------------------------|---------------------------------------|----------------------------|
| `payment.succeeded`    | Handles successful payment events     | `PaidOrderDto`             |

---

## 🔄 Order Lifecycle

### Order Status Flow
```
CREATE ORDER → PENDING → PAID → DELIVERED
                ↓
             CANCELLED
```

### Status Descriptions
- **PENDING** - Order created, awaiting payment
- **PAID** - Payment confirmed, order processing
- **DELIVERED** - Order completed and delivered
- **CANCELLED** - Order cancelled by user or system

### Order Creation Process
1. **Validate Products** - Checks product existence via Products MS
2. **Calculate Totals** - Computes total amount and item count
3. **Create Order** - Saves order and items to database
4. **Create Payment Session** - Generates payment link via Payments MS
5. **Return Payment Data** - Returns payment session to client

---

## 💳 Payment Integration

### Payment Session Creation
When an order is created, the service automatically:
- Validates all products exist and are available
- Calculates total amount based on current product prices
- Creates a Stripe payment session via the Payments microservice
- Returns payment URL and session data to the client

### Payment Success Handling
The service listens for `payment.succeeded` events and automatically:
- Updates order status to `PAID`
- Sets `paid: true` and `paidAt` timestamp
- Stores Stripe charge ID for reference
- Creates order receipt record

---

## 🔗 Microservice Dependencies

### Products Microservice
- **Pattern**: `validate_products_ids`
- **Purpose**: Validate product existence and get current prices
- **Required**: Yes (order creation fails without this)

### Payments Microservice  
- **Pattern**: `payments.session.create`
- **Purpose**: Create Stripe payment sessions
- **Required**: Yes (for payment processing)

### Client Gateway
- **Exposes**: All order operations via HTTP endpoints
- **Authentication**: Handled at gateway level

---

## 📌 Additional Notes

- **PostgreSQL Database**: Uses Neon Cloud for production-ready PostgreSQL hosting
- **Transaction Safety**: Order creation uses database transactions for data consistency
- **Product Price Validation**: Always uses current product prices from Products MS
- **Soft Dependencies**: Gracefully handles temporary microservice unavailability
- **Event-Driven Updates**: Payment status changes automatically trigger order updates
- **UUID Identifiers**: Orders use UUID for unique identification
- **Audit Trail**: Tracks creation and update timestamps for all orders

### Development Scripts
```bash
# Start with automatic DB setup
npm run start:dev

# Manual database setup
npm run docker:start

# Production build
npm run build
npm run start:prod
```

---

## 📄 License

This project is licensed under the **MIT License**.

---

## 🤝 Author

**Nelson G.**  
[GitHub](https://github.com/nelsin-06)  
[LinkedIn](https://www.linkedin.com/in/nelson-gallego-tec-dev)
