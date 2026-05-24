import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Building2,
  Brain,
  BrainCircuit,
  GitBranch,
  Sparkles,
  Menu,
  X,
  PieChart,
  GitCompare,
  Tags,
  Search,
  Timer,
  MessageSquare,
  Swords,
} from "lucide-react";
import { useState } from "react";

const navItems = [
  { to: "/", label: "Home", icon: LayoutDashboard },
  { to: "/companies", label: "Explore Companies", icon: Building2 },
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/compare", label: "Compare", icon: GitCompare },
  { to: "/skill-mapping", label: "Skill Mapping", icon: Brain },
  { to: "/hiring-skill-set", label: "Skill Sets", icon: Tags },
  { to: "/hiring-process", label: "Hiring Rounds", icon: GitBranch },
  { to: "/innovx", label: "INNOVX", icon: Sparkles },
  { to: "/analytics", label: "Analytics", icon: PieChart },
  { to: "/candidate-analyzer", label: "Candidate Analyzer", icon: BrainCircuit },
  { to: "/rejection-probability", label: "Rejection Engine", icon: BrainCircuit },
  { to: "/placement-war-room", label: "War Room", icon: Swords },
  { to: "/placement-timeline", label: "Placement Timeline", icon: Timer },
  { to: "/interview-experiences", label: "Interview Insights", icon: MessageSquare },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-14 items-center border-b px-4">
            <Link to="/" className="flex items-center gap-2" onClick={() => setSidebarOpen(false)}>
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <Building2 className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black leading-none tracking-tight uppercase">PESCE Placement Intelligence</span>
                <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
                  Enterprise Portal
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  location.pathname === item.to
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar for mobile */}
        <header className="lg:hidden flex h-14 items-center justify-between border-b bg-card px-4">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-muted"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
              <Building2 className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-sm font-black uppercase tracking-tighter">PESCE Placement Intelligence</span>
          </Link>
          <div className="w-10" /> {/* Spacer */}
        </header>

        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
