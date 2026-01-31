// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/Auth/LoginSlice';
import { schedulePaymentApi } from '../src/features/SchedulePayment/SchedulePaymentSlice';   // ← नया



export const store = configureStore({
  reducer: {
    auth: authReducer,

    // RTK Query reducers
    [schedulePaymentApi.reducerPath]: schedulePaymentApi.reducer,

   
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(schedulePaymentApi.middleware)
      
});

export default store;