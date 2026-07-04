import { BadgeCheck } from "lucide-react";

export default function VerifiedMark() {
  return (
    <span className="inline-flex items-center gap-1 text-brass" title="Verified alumnus">
      <BadgeCheck size={14} />
    </span>
  );
}