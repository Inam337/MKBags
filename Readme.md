# MK Bags

Premium bags e-commerce website built with HTML, CSS, Bootstrap 5, and JavaScript.

## Pages

- `index.html` — Homepage (hero, trending products, commitment section)
- `products.html` — Full product catalog with search & filters
- `about.html` — Brand story and values
- `contact.html` — Contact form (sends via WhatsApp)

## Project Structure

```
MkBags/
├── index.html
├── products.html
├── about.html
├── contact.html
├── assets/
│   ├── css/
│   │   ├── style.css
│   │   └── responsive.css
│   ├── js/
│   │   ├── data.js       — Product catalog & site config
│   │   ├── cart.js       — Shopping cart (localStorage)
│   │   ├── whatsapp.js   — WhatsApp order integration
│   │   ├── products.js   — Product rendering & filters
│   │   └── app.js        — UI interactions
│   └── images/
│       ├── logo/
│       ├── hero/
│       └── products/
└── README.md
```

## Features

- Responsive design matching modern e-commerce UI
- Shopping cart with localStorage persistence
- WhatsApp checkout integration
- Product search and category filtering
- USD pricing

## Setup

Open `index.html` in a browser, or use a local server:

```bash
npx serve .
```

## Configuration

Edit `assets/js/data.js` to update:
- WhatsApp number
- Contact email/phone
- Product catalog and prices

## Author

Inam Malik
