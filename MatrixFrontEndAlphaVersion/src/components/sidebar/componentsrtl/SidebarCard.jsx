import { useState } from "react";
import { MdEmail, MdPhone, MdAdminPanelSettings } from "react-icons/md";

const SidebarCard = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative mt-14 flex justify-center">
      {/* Circular Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`relative z-10 flex h-16 w-16 items-center justify-center rounded-full border-[4px] border-white bg-gradient-to-b from-[#4F46E5] to-[#9333EA] transition-all duration-300 hover:scale-105 dark:!border-navy-800 ${
          isExpanded ? 'scale-90' : ''
        }`}
      >
        <MdAdminPanelSettings className="h-8 w-8 text-white" />
      </button>

      {/* Expandable Card */}
      <div
        className={`absolute bottom-[calc(100%+1rem)] left-1/2 flex w-[256px] -translate-x-1/2 flex-col items-center rounded-[20px] bg-gradient-to-br from-[#4F46E5] via-[#7C3AED] to-[#9333EA] pb-4 shadow-xl transition-all duration-300 ${
          isExpanded
            ? 'pointer-events-auto translate-y-0 opacity-100 z-[60]'
            : 'pointer-events-none translate-y-4 opacity-0'
        }`}
      >
        {/* Arrow pointing down to the icon */}
        <div className="absolute -bottom-2 left-1/2 h-4 w-4 -translate-x-1/2 rotate-45 bg-[#9333EA]" />

        <div className="relative z-[61] mt-4 flex h-fit w-full flex-col items-center px-4">
          <p className="text-lg font-bold text-white">Admin Support</p>
          <p className="mt-1 text-center text-sm text-white">
            Contact the Matrix Development Team for assistance
          </p>

          <div className="mt-4 w-full space-y-2">
            <a
              href="mailto:matrix@support.com"
              className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <MdEmail className="h-5 w-5" />
              <span>matrix@support.com</span>
            </a>
            
            <a
              href="tel:7386678998"
              className="flex items-center gap-2 rounded-lg bg-white/20 px-3 py-2 text-sm text-white hover:bg-white/30"
              onClick={(e) => e.stopPropagation()}
            >
              <MdPhone className="h-5 w-5" />
              <span>+91 7386678998</span>
            </a>

            <a
              href="/admin/manual"
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-medium text-[#4F46E5] hover:bg-gray-100"
              onClick={(e) => e.stopPropagation()}
            >
              <MdAdminPanelSettings className="h-5 w-5" />
              View Admin Manual
            </a>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
};

export default SidebarCard;
