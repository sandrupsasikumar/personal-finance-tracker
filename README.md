# SpendCheck — Personal Finance Tracker

**Live site:** https://sandrupsasikumar.github.io/personal-finance-tracker/

A lightweight, client-side personal finance tracker built with React, Tailwind CSS, and localStorage. No backend, no build step — just open `index.html` in a browser.

---

## Features

### Budget Tab
- **Expense tracking** — log expenses with title, amount, category, date, and optional notes
- **Category budgets** — set per-category spending limits and track progress with visual indicators
- **Recurring expenses** — define expenses that auto-apply on a schedule (daily, weekly, monthly)
- **Trends chart** — visualize spending over time by category
- **CSV export** — export all expenses to a `.csv` file for use in spreadsheets

### Split Tab
- **Expense groups** — create groups for trips, dinners, or any shared spending
- **Flexible splits** — assign custom amounts per member or split equally with one click
- **Balance visualization** — color-coded pill badges show at a glance who owes whom
- **Net summary** — see your total owed or owing across all members in a group
- **Smart settlement** — "How to settle up" section calculates the minimum number of payments needed to clear all debts using a greedy debt simplification algorithm
- **Member avatar chips** — members displayed as labeled chips with initials; your chip is highlighted

### General
- **Multi-user support** — separate accounts stored in localStorage, each with a private dataset
- **Account management** — update display name, email, username, and password
- **Dark theme** — consistent dark UI using a custom color palette

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 18 (CDN, no build step) |
| Styling | Tailwind CSS (CDN) |
| Storage | `localStorage` via a thin wrapper in `js/storage.js` |
| Charts | Custom canvas-based trends chart |
| Icons | Inline SVG components in `js/components/Icons.js` |

---

## Project Structure

```
personal-finance-tracker/
├── index.html                  # Entry point — loads all scripts
├── js/
│   ├── storage.js              # localStorage read/write helpers
│   ├── constants.js            # Category list and app-wide constants
│   └── components/
│       ├── App.js              # Root component, auth flow, routing
│       ├── Dashboard.js        # Budget tab — expenses, charts, summary
│       ├── SplitterPage.js     # Split tab — groups, balances, settlement
│       ├── SplitForm.js        # Create group modal
│       ├── RecurringModal.js   # Recurring expense management
│       ├── AccountModal.js     # Account settings modal
│       ├── SettingsModal.js    # Budget/income/category budget settings
│       └── Icons.js            # SVG icon components
```

---

## Getting Started

1. Clone or download the repository
2. Open `index.html` in any modern browser
3. Create an account and start tracking

No npm install, no build process, no server required.

---

## Data Storage

All data is stored in `localStorage` under each user's account key. The data structure per user:

```json
{
  "budget": 2000,
  "income": 0,
  "expenses": [],
  "categoryBudgets": {},
  "recurring": {},
  "recurringApplied": {},
  "name": "",
  "email": "",
  "groups": []
}
```

Data is private to the browser — clearing localStorage will erase all accounts and data.

---

## Future Functionality

### Backend & Persistence
- **Database storage** — migrate from localStorage to a server-side database (e.g. PostgreSQL, MongoDB) so data persists across devices and browsers
- **Cloud sync** — real-time sync across multiple devices tied to one account
- **Data backup & restore** — export/import a full account snapshot as JSON

### Authentication & Accounts
- **OAuth login** — sign in with Google, GitHub, etc. instead of a username/password form
- **Session management** — JWT or cookie-based sessions with token refresh
- **Account deletion** — self-service account and data removal

### Split Expenses
- **Payment recording** — log actual cash/transfer payments to track settlement progress, not just mark a group as fully settled
- **Recurring split expenses** — schedules for shared bills like rent or utilities that repeat every month
- **Invite links** — share a group link so other users can join and view/add expenses directly
- **Percentage & weighted splits** — split by custom percentages or weighted shares instead of only equal or manual amounts

### Budget & Expenses
- **Bank integration** — connect via Plaid or Open Banking APIs to auto-import transactions
- **Receipt scanning** — OCR on a photo of a receipt to auto-fill expense fields
- **Notifications & alerts** — push or email alerts when approaching a category budget limit
- **PDF export** — generate a formatted monthly spending report as a PDF alongside the existing CSV export

### Insights & Analytics
- **AI spending insights** — natural language summaries of spending patterns ("You spent 40% more on dining this month")
- **Forecasting** — project end-of-month spend based on current pace
- **Savings goals** — define targets and track progress over time

### Platform
- **Progressive Web App (PWA)** — installable on mobile with offline support
- **Mobile-native app** — React Native port for iOS and Android
