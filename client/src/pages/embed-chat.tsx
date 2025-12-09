import DiagnosticChat from "@/components/diagnostic-chat";

export default function EmbedChat() {
  const handleBookingClick = () => {
    window.open("https://link.flow-build.com/widget/bookings/thefreedomroadmap", "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-start py-4 px-2">
        <DiagnosticChat embedded={true} onBookingClick={handleBookingClick} />
      </main>
    </div>
  );
}
