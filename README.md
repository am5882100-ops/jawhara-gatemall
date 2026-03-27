# Jawhara Jewellery — The Gate Mall Branch
## Sales Management System

A luxury, high-end branch management web application for tracking daily gold and diamond sales, sold pieces, and generating professional monthly reports.

---

## 🏆 Completed Features

### 1. Daily Sales Entry
- Full CRUD (Create, Read, Update, Delete)
- Fields: Date, Gold Sales, Gold Profit, Diamond Sales, Diamond Profit, Notes
- Live auto-calculation preview while typing:
  - Gold % = (Gold Profit / 418) × 100
  - Diamond % = (Diamond Profit / 418) × 100
  - Total Profit = Gold + Diamond Profit
  - Total % = Gold % + Diamond %
- Inline editing from the table
- Month filter for the table
- Pagination (10 rows per page)

### 2. Monthly Sold Pieces
- Full CRUD
- Fields: Date, Item Name, Quantity, Notes
- Month filter and pagination
- Inline editing

### 3. Monthly Sales Report (Print-ready)
- Select any month to generate full report
- Daily breakdown table with all percentages
- Monthly summary KPIs:
  - Total Gold Profit, Total Diamond Profit, Total Profit
  - Average Gold %, Average Diamond % (per day)
  - **Total Month % = Sum of all daily Total %** (e.g. 4 days × 30% = 120%)
- Sold pieces table for the month
- A4 print-optimized layout (`window.print()`)
- Elegant typography-only header (no logos)

### 4. Dashboard
- Today's KPIs: Gold Profit, Diamond Profit, Total Profit (with %)
- Current month total profit and number of days recorded
- Filterable by month and searchable by notes
- Live preview tables for sales and pieces
- Pagination on all tables

### 5. UX/UI
- Luxury brand aesthetic with Cormorant Garamond + Montserrat fonts
- Gold & diamond color palette
- Toast notifications for all user actions
- Confirmation modal for deletions
- Auto-reset forms after save
- Fully responsive (mobile, tablet, desktop)

---

## 📐 Calculation Reference

| Formula | Rule |
|---|---|
| Daily Target | **418 KWD** |
| Gold % | `(Gold Profit ÷ 418) × 100` |
| Diamond % | `(Diamond Profit ÷ 418) × 100` |
| Total % | `Gold % + Diamond %` |
| Monthly Total % | **Sum** of all daily Total % (not average) |

### Example:
| Day | Gold % | Diamond % | Total % |
|---|---|---|---|
| Day 1 | 15% | 15% | 30% |
| Day 2 | 15% | 15% | 30% |
| Day 3 | 15% | 15% | 30% |
| Day 4 | 15% | 15% | 30% |
| **Monthly** | **60%** | **60%** | **120%** |

---

## 🗂️ Data Storage

- **Local Storage**: All data saved to browser localStorage for offline use
- **Remote API**: All CRUD operations synced to the remote table API
  - `tables/daily_sales` — Daily sales records
  - `tables/monthly_pieces` — Sold pieces records

### Data Models

**daily_sales**
- id, date, gold_sales, gold_profit, diamond_sales, diamond_profit, notes
- gold_profit_pct, diamond_profit_pct, total_profit, total_pct (computed)

**monthly_pieces**
- id, date, item_name, quantity, notes

---

## 🔗 Navigation Paths

| Page | Section ID |
|---|---|
| Dashboard | `#section-dashboard` |
| Daily Sales | `#section-daily-sales` |
| Monthly Pieces | `#section-monthly-pieces` |
| Monthly Report | `#section-report` |

---

## 🚀 Recommended Next Steps

1. Add user authentication for branch staff
2. Export report to PDF via browser API
3. Add comparative charts (monthly trends)
4. Implement multi-branch support
5. Add email report scheduling
