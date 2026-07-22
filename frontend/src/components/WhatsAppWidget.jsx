import React from 'react';

export const WhatsAppWidget = () => {
  const phoneNumber = '918438926321';
  const whatsappUrl = `https://wa.me/${phoneNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 md:bottom-6 right-6 z-[100] bg-[#25D366] text-white p-3 md:p-4 rounded-full shadow-xl hover:shadow-2xl hover:scale-110 transition-all duration-300 group flex items-center justify-center"
      aria-label="Chat on WhatsApp"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="w-8 h-8 md:w-10 md:h-10 fill-current"
        viewBox="0 0 24 24"
      >
        <path d="M12.031 0C5.385 0 0 5.385 0 12.031c0 2.115.548 4.17 1.589 5.986L.045 23.955l6.104-1.603a12.025 12.025 0 0 0 5.882 1.528h.005c6.645 0 12.03-5.385 12.03-12.031S18.676 0 12.031 0zm0 21.844a9.985 9.985 0 0 1-5.086-1.393l-.365-.216-3.784.992.997-3.69-.237-.377a9.982 9.982 0 0 1-1.528-5.321c0-5.516 4.49-10.005 10.006-10.005 5.515 0 10.004 4.489 10.004 10.005 0 5.517-4.489 10.005-10.004 10.005zm5.485-7.488c-.3-.151-1.782-.88-2.059-.98-.276-.1-.478-.151-.678.151-.202.302-.78 1.01-.955 1.21-.176.202-.352.227-.652.076-1.597-.803-2.67-1.464-3.687-2.924-.226-.328.225-.302.825-1.503.076-.151.038-.277-.037-.428-.076-.151-.678-1.631-.93-2.234-.246-.588-.495-.508-.678-.518-.176-.008-.378-.008-.578-.008-.202 0-.528.076-.803.378-.276.302-1.054 1.031-1.054 2.516 0 1.485 1.08 2.92 1.23 3.12.151.202 2.13 3.252 5.158 4.555.72.31 1.282.495 1.721.634.722.228 1.38.196 1.897.119.58-.086 1.782-.728 2.033-1.433.251-.705.251-1.31.176-1.433-.076-.126-.277-.202-.578-.353z" />
      </svg>
      {/* Tooltip */}
      <span className="absolute right-full mr-4 bg-slate-800 text-white text-sm px-3 py-2 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none after:content-[''] after:absolute after:top-1/2 after:-translate-y-1/2 after:left-full after:border-8 after:border-transparent after:border-l-slate-800">
        Chat with us!
      </span>
    </a>
  );
};
