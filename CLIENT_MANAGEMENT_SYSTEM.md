# 👥 Client Management System - Complete Documentation

## 📋 Overview

A comprehensive client management system with **partial payment tracking**, integrated with your caisse system. Clients can pay in full or make deposits, with all payments automatically updating caisse balances and tracking outstanding amounts.

## 🎯 Key Features

### 1. **Client Management**
- Add clients with full contact information
- Track client history and statistics
- Soft-delete protection for clients with orders
- View total revenue and outstanding balance per client

### 2. **Order Management**
- Create orders with multiple items/services
- Automatic order number generation (ORD-00001, ORD-00002, etc.)
- Track order status from DRAFT to FULLY_PAID
- Calculate totals automatically
- Set due dates for payments

### 3. **Flexible Payment System**
- **Full Payment**: Client pays entire remaining balance
- **Partial Payment (Deposit)**: Client pays any amount up to remaining balance
- Payments automatically added to selected caisse
- Track payment history with methods (Cash, Bank Transfer, Check, etc.)
- Real-time balance updates

### 4. **Status Tracking**
- `DRAFT` - Order created but not confirmed
- `CONFIRMED` - Order accepted, awaiting payment
- `PARTIALLY_PAID` - Client has made a deposit
- `FULLY_PAID` - All payments complete
- `CANCELLED` - Order cancelled

## 🏗️ Database Structure

### Models Created:

```prisma
model Client {
  id        String
  name      String
  email     String?
  phone     String?
  address   String?
  notes     String?
  isActive  Boolean
  orders    ClientOrder[]
}

model ClientOrder {
  id              String
  orderNumber     String @unique
  clientId        String
  totalAmount     Float
  paidAmount      Float
  remainingAmount Float
  status          OrderStatus
  orderDate       DateTime
  dueDate         DateTime?
  description     String?
  items           OrderItem[]
  payments        ClientPayment[]
}

model OrderItem {
  description String
  quantity    Float
  unitPrice   Float
  totalPrice  Float
}

model ClientPayment {
  orderId       String
  amount        Float
  paymentMethod PaymentMethod
  caisseId      String
  paymentDate   DateTime
  reference     String?
  notes         String?
}
```

## 💰 Payment Flow Example

### Scenario: Client Orders for 50,000 DH

**Step 1: Create Order**
```
Order Total: 50,000 DH
Paid: 0 DH
Remaining: 50,000 DH
Status: CONFIRMED
```

**Step 2: Client Pays 20,000 DH Deposit**
```
Payment: 20,000 DH → Caisse Événements
Order Updates:
  - Paid: 20,000 DH
  - Remaining: 30,000 DH
  - Status: PARTIALLY_PAID
  
Caisse Balance: +20,000 DH
Dashboard: Shows 30,000 DH outstanding
```

**Step 3: Client Completes Payment (30,000 DH)**
```
Payment: 30,000 DH → Caisse Événements
Order Updates:
  - Paid: 50,000 DH
  - Remaining: 0 DH
  - Status: FULLY_PAID
  
Caisse Balance: +30,000 DH
Dashboard: No outstanding balance
```

## 🚀 How to Use

### 1. Run Migration

```bash
# Generate Prisma client
npx prisma generate

# Reset database (development)
npx prisma migrate reset --force

# OR for production
npx prisma migrate dev --name add_client_management
```

### 2. Access the Client Management

Add to your navigation (example in `app/page.tsx`):

```typescript
import ClientManagement from '@/components/ClientManagement'

// In your tabs or sections:
<ClientManagement />
```

### 3. Create a Client

1. Click "Nouveau Client"
2. Enter name (required) and contact info
3. Click "Créer le Client"

### 4. Create an Order

1. Find the client in the list
2. Click "Commande" button
3. Add items/services:
   - Description
   - Quantity
   - Unit Price
   - Auto-calculates total
4. Set due date (optional)
5. Click "Créer la Commande"

### 5. Record a Payment

**For Full Payment:**
1. Click on client to view details
2. Select order
3. Click "Enregistrer Paiement"
4. Choose "Paiement Complet"
5. Select caisse
6. Select payment method
7. Click "Enregistrer"

**For Partial Payment (Deposit):**
1. Same steps as above
2. Choose "Acompte / Partiel"
3. Enter custom amount
4. Rest of steps same

## 📊 Dashboard Integration

### New Statistics Displayed:

1. **Total Clients** - Number of active clients
2. **Revenu Clients** - Total amount paid by all clients
3. **Soldes Impayés** - Outstanding balances across all orders
4. **Clients avec Dette** - Number of clients with partial payments

### Calculations:

```typescript
Net Balance = Current Caisse Balance - Unpaid Charges - Outstanding Client Balances
True Available Cash = Net Balance
```

## 📁 Files Created

### API Routes:
- `/app/api/clients/route.ts` - Client CRUD operations
- `/app/api/orders/route.ts` - Order management
- `/app/api/payments/route.ts` - Payment processing

### Components:
- `/components/ClientManagement.tsx` - Main client interface
- `/components/ClientForm.tsx` - Add/edit client form
- `/components/OrderForm.tsx` - Create orders with items
- `/components/PaymentForm.tsx` - Record payments (full/partial)

### Database:
- Updated `prisma/schema.prisma` - New models
- Updated `prisma/seed.ts` - Sample data

## 🎨 UI Features

### Client List View:
- Contact information display
- Total orders count
- Revenue and outstanding balance
- Quick actions (Details, New Order)

### Order Form:
- Dynamic item addition/removal
- Real-time total calculation
- Visual item cards
- Date picker for due dates

### Payment Form:
- Order summary with breakdown
- Full vs Partial payment toggle
- Visual payment type selection
- Automatic remaining balance calculation
- Shows impact before confirmation

## 🔒 Security & Validation

- ✅ Authentication required for all endpoints
- ✅ Payment amount cannot exceed remaining balance
- ✅ Soft-delete for clients with existing orders
- ✅ Transaction atomicity (payment + caisse update together)
- ✅ Order number uniqueness enforced
- ✅ Input validation on all forms

## 📈 Business Logic

### Automatic Updates:

**When Payment is Created:**
1. Order `paidAmount` increases
2. Order `remainingAmount` decreases
3. Order `status` updates automatically
4. Caisse `balance` increases
5. Transaction record created for tracking
6. Dashboard stats refresh

### Status Rules:

```typescript
if (remainingAmount === 0) → FULLY_PAID
else if (paidAmount > 0) → PARTIALLY_PAID
else if (paidAmount === 0 && confirmed) → CONFIRMED
else → DRAFT
```

## 🎯 Use Cases

### Use Case 1: Event Planning Company
```
Client: Mohammed Alami
Order: Wedding Organization - 50,000 DH
  - Decoration: 15,000 DH
  - Catering (200 guests): 25,000 DH
  - Photography: 8,000 DH
  - Sound system: 2,000 DH

Payment 1: 20,000 DH deposit (40%) → Caisse Événements
Payment 2: 30,000 DH final (60%) → Caisse Événements
```

### Use Case 2: B2B Services
```
Client: Société ABC SARL
Order: Monthly Office Supplies - 8,500 DH
  - Paper A4 (50 reams): 1,500 DH
  - Ink cartridges: 3,000 DH
  - Misc supplies: 4,000 DH

Payment 1: 3,500 DH initial → Caisse Magasin
Payment 2: 5,000 DH on delivery → Caisse Magasin
```

## 📊 Reports & Analytics

### Available Metrics:

1. **Per Client:**
   - Total orders
   - Total revenue (paid amount)
   - Outstanding balance
   - Payment history

2. **Global:**
   - Total clients
   - Total client revenue
   - Total outstanding
   - Average order value
   - Clients with debt count

3. **Per Order:**
   - Total amount
   - Paid amount
   - Remaining amount
   - Payment count
   - Status timeline

## 🔧 API Endpoints

### Clients:
```
GET    /api/clients           - List all clients with stats
POST   /api/clients           - Create new client
PATCH  /api/clients           - Update client
DELETE /api/clients?id={id}   - Delete/deactivate client
```

### Orders:
```
GET    /api/orders                    - List all orders
GET    /api/orders?clientId={id}      - List client orders
POST   /api/orders                    - Create new order
PATCH  /api/orders                    - Update order status
```

### Payments:
```
GET    /api/payments                  - List all payments
GET    /api/payments?orderId={id}     - List order payments
POST   /api/payments                  - Record new payment
```

## 🎉 Benefits

1. **Cash Flow Clarity**: Know exactly how much is in caisse vs outstanding
2. **Client Trust**: Track deposits and balances professionally
3. **Financial Accuracy**: All payments automatically update caisses
4. **Debt Management**: See which clients owe money at a glance
5. **Payment Flexibility**: Accept full or partial payments
6. **Historical Tracking**: Complete payment history per order
7. **Status Visibility**: Real-time order status updates

## 🔮 Future Enhancements

Possible additions:
- Email/SMS notifications for payment reminders
- Recurring orders for regular clients
- Payment plans with installments
- Client credit limits
- Discount management
- Invoice PDF generation
- Client portal for self-service
- Payment receipts
- Late payment penalties

## ✅ Complete Integration

Your system now has:
- ✅ **Caisses** → Store money
- ✅ **Achats** → Deduct from caisses
- ✅ **Charges** → Deduct from caisses (when paid)
- ✅ **Revenue** → Add to caisses
- ✅ **Clients** → Orders with partial/full payments → Add to caisses
- ✅ **Dashboard** → Real-time view of everything

Everything is interconnected and updates automatically! 🚀

## 📝 Sample Data Included

The seed file creates:
- 3 clients with different profiles
- 4 orders with various statuses
- Payment history showing partial and full payments
- Realistic amounts and dates

Perfect for testing and demonstration!

