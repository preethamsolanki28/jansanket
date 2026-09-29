import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  return (
    <header className="border-b border-border bg-white sticky top-0 z-50">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="font-bold text-xl text-primary tracking-tight">JanSanket</span>
          </Link>
          <span className="hidden sm:inline-block text-xs text-muted-foreground border-l border-border pl-3">
            Citizen Demand Intelligence
          </span>
          <Badge variant="outline" className="bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD] text-xs font-medium">
            Demo data
          </Badge>
        </div>

        <nav className="flex items-center gap-4 text-sm font-medium">
          <Link
            href="/dashboard"
            className="text-foreground hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-slate-100"
          >
            Dashboard
          </Link>
          <Link
            href="/submit"
            className="text-foreground hover:text-primary transition-colors py-1 px-2 rounded-md hover:bg-slate-100"
          >
            Submit Request
          </Link>
        </nav>
      </div>
    </header>
  );
}
