import React from "react";
import { ShieldCheck, Award, FileCheck, CheckCircle2 } from "lucide-react";

export function TrustBar() {
  const items = [
    {
      icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />,
      title: "Govt. Approved Fire Contractor",
      desc: "Accredited Directorate of Fire Services",
    },
    {
      icon: <Award className="w-4 h-4 text-primary-700" />,
      title: "100% ISI & CE Certified",
      desc: "IS 15683, IS 2190 & IS 2878 compliant",
    },
    {
      icon: <FileCheck className="w-4 h-4 text-orange-600" />,
      title: "Form B Compliance Assistance",
      desc: "Biannual statutory safety clearance",
    },
    {
      icon: <CheckCircle2 className="w-4 h-4 text-blue-600" />,
      title: "Automated Expiry & AMC Tracker",
      desc: "SMS & digital portal reminders",
    },
  ];

  return (
    <div className="bg-white border-y border-slate-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 lg:gap-8">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-2.5 sm:gap-3">
              <div className="p-2 rounded-lg bg-slate-50 border border-slate-100 shrink-0 mt-0.5">
                {item.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-bold text-dark leading-snug">
                  {item.title}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default TrustBar;
