# Reset Database Script

## Quick Reset (After Login)

1. Login to: https://saidhanouraccounting.vercel.app/login
2. Press F12 to open console
3. Paste this code and press ENTER:

```javascript
fetch('https://saidhanouraccounting.vercel.app/api/reset-database', {
    method: 'POST',
    credentials: 'include'
})
.then(r => r.json())
.then(data => {
    console.log(data);
    if(data.success) {
        alert('Database reset! All balances now 0. Refreshing...');
        location.reload();
    } else {
        alert('Error: ' + JSON.stringify(data));
    }
});
```

## What Gets Deleted:
- All Transactions
- All Clients
- All Suppliers
- All Orders (Client & Supplier)
- All Achats
- All Charges

## What Stays:
- Admin User (you can still login)
- 3 Caisses (but balance = 0)
- 5 Charge Categories

## Alternative: Direct Neon Database Reset

If you want to completely wipe everything and start fresh:

1. Go to: https://console.neon.tech
2. Select your database
3. Go to SQL Editor
4. Run this SQL:

```sql
-- Delete all data
TRUNCATE TABLE "Transaction" CASCADE;
TRUNCATE TABLE "ClientPayment" CASCADE;
TRUNCATE TABLE "SupplierPayment" CASCADE;
TRUNCATE TABLE "OrderItem" CASCADE;
TRUNCATE TABLE "SupplierOrderItem" CASCADE;
TRUNCATE TABLE "ClientOrder" CASCADE;
TRUNCATE TABLE "SupplierOrder" CASCADE;
TRUNCATE TABLE "Client" CASCADE;
TRUNCATE TABLE "Supplier" CASCADE;
TRUNCATE TABLE "Achat" CASCADE;
TRUNCATE TABLE "Charge" CASCADE;

-- Reset caisse balances to 0
UPDATE "Caisse" SET balance = 0, "fixedAmount" = 0;

-- Keep admin user and categories
```


