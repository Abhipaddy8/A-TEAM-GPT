import { useRef } from "react";

interface CalendarPopupProps {
  isOpen: boolean;
  onClose: () => void;
  calendarUrl?: string;
}

export default function CalendarPopup({ isOpen, onClose, calendarUrl = "https://link.flow-build.com/widget/booking/zXUkPVoGKzRyirwYa0Ck" }: CalendarPopupProps) {
  const sectionRef = useRef<HTMLDivElement>(null);

  return (
    <section
      ref={sectionRef}
      id="booking-calendar"
      className="animate-slideDown my-8"
    >
      <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl border border-gray-200 shadow-lg overflow-hidden max-w-5xl mx-auto">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-white flex items-center justify-between">
          <h2 className="text-xl font-semibold text-brand-dark-navy">
            Book Your Scale Session
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close calendar"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Calendar Container */}
        <div className="w-full overflow-hidden bg-white">
          <iframe
            src={calendarUrl}
            className="w-full h-full border-0"
            title="Book Scale Session"
            allow="payment"
            style={{
              minHeight: '600px',
              margin: 0,
              padding: 0,
              borderRadius: 0,
              display: 'block'
            }}
          />
        </div>
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
      `}</style>
    </section>
  );
}
