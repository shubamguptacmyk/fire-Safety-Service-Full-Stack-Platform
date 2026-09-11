const TONES = {
  steel: "bg-steel/10 text-steel",
  red: "bg-brand/10 text-brand",
  amber: "bg-amber/15 text-[#9c6a16]",
  safe: "bg-safe/10 text-safe",
} as const;

export default function Badge({ children, tone = "steel" }: { children: React.ReactNode; tone?: keyof typeof TONES }) {
  return <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded ${TONES[tone]}`}>{children}</span>;
}
