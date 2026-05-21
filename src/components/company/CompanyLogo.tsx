import { useState } from "react";
import { Building2 } from "lucide-react";

interface CompanyLogoProps {
  src?: string;
  name: string;
  className?: string;
}

export function CompanyLogo({ src, name, className = "" }: CompanyLogoProps) {
  const [error, setError] = useState(false);

  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (!src || error) {
    return (
      <div className={`flex items-center justify-center bg-slate-100 text-slate-400 font-black ${className}`}>
        <span className="text-sm">{initials}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className={`object-contain ${className}`}
      onError={() => setError(true)}
    />
  );
}
