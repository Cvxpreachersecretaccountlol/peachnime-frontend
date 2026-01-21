# Peachnime (Frontend)

Peachnime is a lightweight anime discovery frontend built with Vite and React.

Author: karma hacks

## Overview

- Provides browsing, searching, and watching anime content.
- Uses a separate API backend (`peachnime-API`) for data.

## Requirements

- Node.js 18+ (or compatible)
- pnpm / npm / yarn

## Setup

1. Install dependencies

```powershell
cd peachnime
npm install
```

2. Start development server

```powershell
npm run dev
```

3. Build for production

```powershell
npm run build
```

## Project Structure

- `src/` — main app source
- `components/` — UI components
- `layouts/` — page layouts
- `pages/` — route pages
- `services/` — API hooks

## Notes

The frontend expects the API to run from `peachnime-API`. Configure `src/config/config.js` to point to the API if needed.
