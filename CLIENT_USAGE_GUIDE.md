# 👥 Client Management - Usage Guide

## ✅ Fixed Issues

1. ✅ **Client Details Modal** - Now working! Click "Détails" button on any client
2. ✅ **Order Items Display** - Shows all items/services in each order
3. ✅ **Payment History** - Shows all payments made for each order
4. ✅ **Payment from Details** - Can pay directly from client details view
5. ✅ **Caisse Information** - Shows which caisse received each payment

---

## 🎯 How to Use Client Management

### 1️⃣ **View Client List**
- Go to **"Clients"** tab
- See all clients with:
  - Contact information
  - Total orders count
  - Total revenue (paid)
  - Outstanding balance (dette)

### 2️⃣ **View Client Details** 
Click **"Détails"** button on any client to see:

✅ **Client Information:**
- Name, email, phone, address
- Total stats (orders, revenue, outstanding)

✅ **All Orders** with:
- Order number (ORD-00001, etc.)
- Status badge (Confirmé, Partiellement Payé, Payé)
- Order date and due date
- Description

✅ **Order Items/Services:**
- Each item with quantity and price
- Automatic total calculation

✅ **Payment Summary:**
- Total amount
- Amount paid (green)
- Amount remaining (orange/dette)

✅ **Payment History:**
- All payments made
- Payment date
- Which caisse received the money
- Amount paid

✅ **Quick Actions:**
- **"Paiement" button** - Record payment directly from details

---

## 💰 How to Manage Payments (Dette)

### **Scenario: Client owes 30,000 DH**

#### Option 1: Pay from Client List
1. Click **"Détails"** on the client
2. Find the order with outstanding balance
3. Click **"Paiement"** button
4. Choose payment type:
   - **Paiement Complet** - Pay full 30,000 DH
   - **Acompte/Partiel** - Pay partial amount (e.g., 10,000 DH)
5. Select caisse
6. Select payment method
7. Click **"Enregistrer le Paiement"**

#### Option 2: Pay from Client Details
1. In client details modal
2. Each order shows "Paiement" button if there's a remaining balance
3. Click it to open payment form
4. Same process as above

---

## 📊 What You'll See

### **Order Status Changes:**

```
New Order → CONFIRMÉ
  ↓
First Payment (partial) → PARTIELLEMENT PAYÉ
  ↓
Final Payment → PAYÉ (Fully Paid)
```

### **Visual Indicators:**

- 🔵 **Blue (Confirmé)** - Order confirmed, awaiting payment
- 🟡 **Amber (Partiellement Payé)** - Deposit received, balance outstanding
- 🟢 **Green (Payé)** - Fully paid, no balance
- 🔴 **Red Warning** - Payment overdue (past due date)

### **Payment History Shows:**
```
✓ 24 Nov 2024 via Caisse Événements  +20,000 DH
✓ 26 Nov 2024 via Caisse Événements  +10,000 DH
```

---

## 🎯 Complete Workflow Example

### **1. Create Client**
```
Name: Ahmed Restaurant
Email: ahmed@restaurant.ma
Phone: +212 6 12 34 56 78
```

### **2. Create Order for Client**
```
Items:
  - Traiteur (100 guests) x 15,000 DH
  - Décoration x 5,000 DH
  - Sonorisation x 2,000 DH
Total: 22,000 DH
```

### **3. Client Pays Deposit**
```
Type: Acompte/Partiel
Amount: 10,000 DH (deposit)
Caisse: Caisse Événements
Method: Bank Transfer

Result:
  - Paid: 10,000 DH
  - Remaining: 12,000 DH (dette)
  - Status: PARTIELLEMENT PAYÉ
  - Caisse balance: +10,000 DH
```

### **4. View Client Details**
Click "Détails" to see:
- ✅ Order shows 10,000 DH paid
- ⚠️ 12,000 DH remaining (dette)
- 📜 Payment history: 10,000 DH received

### **5. Client Pays Final Amount**
```
Type: Paiement Complet (auto-fills 12,000 DH)
Amount: 12,000 DH
Caisse: Caisse Événements
Method: Cash

Result:
  - Paid: 22,000 DH (total)
  - Remaining: 0 DH
  - Status: PAYÉ ✓
  - Caisse balance: +12,000 DH
  - Green "Commande entièrement payée" message
```

---

## 🔍 How to Find Clients with Debt

### **Dashboard Shows:**
- **Clients avec Dette** card - Total number of clients with outstanding balances
- **Soldes Impayés** - Total amount owed by all clients

### **In Client List:**
- Look at "Solde Impayé" column
- Clients with debt show amount in orange/amber
- Clients fully paid show "-"

### **In Client Details:**
- Orange "Dette Restante" stat at top
- Each order shows remaining amount
- Red warning if past due date

---

## ✅ Success Indicators

You'll know payments are working when:

1. ✅ **Caisse Balance Increases** when payment recorded
2. ✅ **Order Status Changes** from PARTIELLEMENT_PAYÉ to PAYÉ
3. ✅ **Remaining Amount Decreases** or becomes 0
4. ✅ **Payment History Shows** new payment with date and caisse
5. ✅ **Dashboard Updates** - Outstanding balance decreases
6. ✅ **Green Checkmark** appears: "✓ Commande entièrement payée"

---

## 🎨 Visual Features

### **Color Coding:**
- 🟢 Green - Paid, Positive, Complete
- 🟡 Orange/Amber - Partial, Pending, Outstanding
- 🔵 Blue - Confirmed, Active
- 🔴 Red - Overdue, Warning
- ⚫ Gray - Draft, Inactive

### **Interactive Elements:**
- Hover effects on cards
- Animated modals
- Real-time calculations
- Status badges
- Payment buttons appear only when needed

---

## 🚀 Pro Tips

1. **Use Client Details** - Best way to see complete payment history
2. **Check Dashboard** - Quick overview of all clients with debt
3. **Watch Status Changes** - Status automatically updates with payments
4. **Due Dates** - Orders past due date show red warning
5. **Multiple Payments** - Can make as many partial payments as needed
6. **Full History** - Every payment is tracked and displayed

---

## 📋 Quick Reference

**To Pay Debt:**
1. Client Tab → Détails → Paiement Button

**To See All Debts:**
1. Dashboard → "Soldes Impayés" card

**To Close Order (Pay Full):**
1. Choose "Paiement Complet" → Auto-fills remaining amount

**To Make Partial Payment:**
1. Choose "Acompte/Partiel" → Enter custom amount

---

Your client management system with debt tracking is now fully operational! 🎉

All payments automatically:
- ✅ Update caisse balances
- ✅ Update order status
- ✅ Track payment history
- ✅ Show in client details
- ✅ Reflect in dashboard





