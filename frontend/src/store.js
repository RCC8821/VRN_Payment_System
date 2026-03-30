// src/app/store.js

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/Auth/LoginSlice';
import { schedulePaymentApi } from '../src/features/SchedulePayment/SchedulePaymentSlice';   
import {actualBookingApi} from './features/SchedulePayment/ActualBookingSlice'
// import {summaryApi} from '../src/features/LeadsSummary/SummarySlice'
import {approve1Api} from './features/OfficeExpense/approve1Slice'
import {billEntryApi} from './features/OfficeExpense/BillEntry'
import {dimPaymentApi} from './features/OfficeExpense/paymentSlice'


export const store = configureStore({
  reducer: {
    auth: authReducer,

    // RTK Query reducers
    [schedulePaymentApi.reducerPath]: schedulePaymentApi.reducer,
    [actualBookingApi.reducerPath]: actualBookingApi.reducer,
    [approve1Api.reducerPath]: approve1Api.reducer,
    [billEntryApi.reducerPath]: billEntryApi.reducer,
    [dimPaymentApi.reducerPath]: dimPaymentApi.reducer,
    // [summaryApi.reducerPath]: summaryApi.reducer,

   
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    })
      .concat(schedulePaymentApi.middleware)
      .concat(actualBookingApi.middleware)
      .concat(approve1Api.middleware)
      .concat(billEntryApi.middleware)
      .concat(dimPaymentApi.middleware)
      // .concat(summaryApi.middleware)
      
});

export default store;