import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || "919800000000";
  return (
    <aside aria-label="Support quick actions">
      <a
        href={`https://wa.me/${number}?text=Hello%20Shubam%20Fire%20Protection,%20I%20would%20like%20an%20inquiry%20regarding%20fire%20safety%20equipment/services.`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with a Fire Safety Engineer on WhatsApp"
        className="fixed bottom-6 right-6 group bg-emerald-600 hover:bg-emerald-700 text-white p-3 sm:px-4 sm:py-3 rounded-full shadow-elevated flex items-center gap-2.5 z-40 transition-all duration-200 active:scale-95"
      >
        <div className="relative flex items-center justify-center">
          <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
        </div>
        <span className="hidden sm:inline text-xs font-bold tracking-wide">
          Quick WhatsApp Support
        </span>
      </a>
    </aside>
  );
}
