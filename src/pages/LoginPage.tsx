// This page now delegates to the Firebase-based login component.
// The previous API token login was removed because the backend at /api/auth/token/ is not running.
export { LoginPage } from '../components/auth/LoginPage';
export { LoginPage as default } from '../components/auth/LoginPage';
