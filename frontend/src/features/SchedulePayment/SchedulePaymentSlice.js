

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const schedulePaymentApi = createApi({
  reducerPath: 'schedulePaymentApi',

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // If you need auth token later, add here
      // const token = localStorage.getItem('token');
      // if (token) headers.set('Authorization', `Bearer ${token}`);
      return headers;
    },
  }),

  tagTypes: ['SchedulePayments'],

  endpoints: (builder) => ({
    // GET all schedule payments
    getSchedulePayments: builder.query({
      query: () => '/api/payment/Schedule-Payment',
      providesTags: ['SchedulePayments'],
      transformResponse: (response) => response?.data || [],
    }),

    
    // POST - Update / Append payment schedule
    updateSchedulePayment: builder.mutation({
      query: (body) => ({
        url: '/api/payment/update-Schedule-payment',
        method: 'POST',
        body, // send all fields: paymentId, status, amountReceived, etc.
      }),
      invalidatesTags: ['SchedulePayments'], // this will auto-refetch list after update
    }),
  }),
});

export const {
  useGetSchedulePaymentsQuery,
  useUpdateSchedulePaymentMutation,   // ← new hook
} = schedulePaymentApi;