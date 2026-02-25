// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/Auth/LoginSlice';
import { schedulePaymentApi } from '../src/features/SchedulePayment/SchedulePaymentSlice';   
// import {summaryApi} from '../src/features/LeadsSummary/SummarySlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,

    // RTK Query reducers
    [schedulePaymentApi.reducerPath]: schedulePaymentApi.reducer,
    // [summaryApi.reducerPath]: summaryApi.reducer,

   
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(schedulePaymentApi.middleware)
      // .concat(summaryApi.middleware)
      
});

export default store;