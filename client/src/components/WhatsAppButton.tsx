import { MessageCircle } from "lucide-react";

export default function WhatsAppButton() {
  const number = import.meta.env.VITE_WHATSAPP_NUMBER || "919800000000";
  return (
    <a
      href={`https://wa.me/${number}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 bg-safe text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center hover:bg-safe/90 z-40"
    >
      <MessageCircle className="w-6 h-6" aria-hidden="true" />
    </a>
  );
}
