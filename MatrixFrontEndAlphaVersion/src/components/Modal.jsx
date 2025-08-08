import React from "react";

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center min-h-screen bg-black bg-opacity-40 transition-opacity duration-300"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg mx-2 sm:mx-4 md:mx-0 md:max-w-2xl lg:max-w-3xl bg-white dark:bg-navy-800 rounded-lg shadow-lg dark:shadow-none animate-fadeInUp border border-gray-200 dark:border-white/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold focus:outline-none"
        >
          &times;
        </button>
        {/* Title */}
        <div className="px-6 pt-6 pb-2 border-b border-gray-200 dark:border-white/10">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 dark:text-white">{title}</h2>
        </div>
        {/* Content */}
        <div className="px-6 py-4 max-h-[60vh] sm:max-h-[70vh] overflow-y-auto text-gray-700 dark:text-gray-200 text-base leading-relaxed">
          {children}
        </div>
      </div>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.3s cubic-bezier(0.4,0,0.2,1);
        }
      `}</style>
    </div>
  );
};

export default Modal; 