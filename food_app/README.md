# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## reCAPTCHA setup

Add this to `food_app/.env`:

```env
VITE_RECAPTCHA_SITE_KEY=your_google_recaptcha_site_key
```

Add this to backend environment (`backend/.env`):

```env
RECAPTCHA_SECRET_KEY=your_google_recaptcha_secret_key
```

After updating env files, restart both frontend and backend servers.
