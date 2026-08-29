import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const location = useLocation();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/create-account";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
                <svg className="h-4 w-4 text-primary-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-[11px] font-black leading-none tracking-tight uppercase">
                  PESCE Placement Intelligence
                </span>
                <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
                  Enterprise Portal
                </span>
              </div>
            </Link>
            {isAuthPage && (
              <div className="text-sm text-muted-foreground">
                {location.pathname === "/login" ? (
                  <>
                    Don't have an account?{" "}
                    <Link to="/create-account" className="text-primary font-medium hover:underline">
                      Create one
                    </Link>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
      <footer className="border-t py-4">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted-foreground">
          PESCE Placement Intelligence. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
