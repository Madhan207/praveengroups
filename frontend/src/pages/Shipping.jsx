import React from 'react';

export const Shipping = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-heading font-bold text-slate-900 mb-6">Shipping & Logistics Information</h1>
      <div className="prose prose-slate max-w-none text-slate-600">
        <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-3">Order Processing</h2>
        <p className="mb-4">
          All retail orders (electronics, apparel, etc.) are processed within 1-2 business days. Orders are not shipped or delivered on weekends or holidays.
        </p>
        
        <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-3">Shipping Rates & Delivery Estimates</h2>
        <p className="mb-4">
          Shipping charges for your order will be calculated and displayed at checkout. For our logistics division (Praveen Transports), quotes are provided dynamically based on freight weight and destination.
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li><strong>Standard Delivery:</strong> 3-5 business days</li>
          <li><strong>Express Delivery:</strong> 1-2 business days (Available in select areas)</li>
          <li><strong>Heavy Freight:</strong> Scheduled independently via Praveen Transports</li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-900 mt-6 mb-3">Shipment Confirmation & Order Tracking</h2>
        <p className="mb-4">
          You will receive a Shipment Confirmation email once your order has shipped containing your tracking number(s). The tracking number will be active within 24 hours. You can also track your shipments directly on our Track Booking page.
        </p>
      </div>
    </div>
  );
};
