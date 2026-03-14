
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const actualBookingApi = createApi({
  reducerPath: 'actualBookingApi',

  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      // अगर बाद में authentication चाहिए तो यहाँ token add कर सकते हो
      // const token = localStorage.getItem('token');
      // if (token) {
      //   headers.set('Authorization', `Bearer ${token}`);
      // }
      headers.set('Content-Type', 'application/json');
      return headers;
    },
  }),

  tagTypes: ['ActualBookings'],

  endpoints: (builder) => ({
    // ───────────────────────────────────────────────
    // पहले से मौजूद GET - सभी bookings लाने के लिए
    // ───────────────────────────────────────────────
    getActualBookings: builder.query({
      query: () => '/api/Booking/Actual-booking-Amount',

      transformResponse: (response) => response?.data || [],

      providesTags: ['ActualBookings'],
    }),

    // ───────────────────────────────────────────────
    // नया POST - payment details update करने के लिए
    // (Bookings sheet में AI:AR columns update करता है)
    // ───────────────────────────────────────────────
    updateBookingPayment: builder.mutation({
      query: (paymentData) => ({
        url: '/api/Booking/update-booking-payment',   // आपके router में दिया हुआ route
        method: 'POST',
        body: paymentData,
      }),

      // सफल होने पर list को invalidate कर दो → automatic refetch होगा
      invalidatesTags: ['ActualBookings'],

      // Optional: response को transform भी कर सकते हो
      transformResponse: (response) => ({
        success: response.success,
        message: response.message,
        bookingId: response.bookingId,
        updatedRow: response.updatedRow,
      }),

      // Optional: error handling में custom message दिखा सकते हो
      transformErrorResponse: (response) => ({
        status: response.status,
        message: response.data?.message || 'Payment update failed',
      }),
    }),
  }),
});

// Export hooks
export const {
  useGetActualBookingsQuery,
  useUpdateBookingPaymentMutation,     // ← नया hook
} = actualBookingApi;

export default actualBookingApi;