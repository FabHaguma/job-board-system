import { configureStore } from '@reduxjs/toolkit';
import authReducer, { logout } from '../features/auth/authSlice';
import { registerUnauthorizedHandler } from '../services/api';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    // Add other feature slices here later
  },
});

// Register global API -> store bridge for 401 handling (avoids circular imports)
registerUnauthorizedHandler(() => store.dispatch(logout()));