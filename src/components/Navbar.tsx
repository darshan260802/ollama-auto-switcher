import { useAuth } from "../context/AuthContext";
import { LogOut } from "lucide-react";

export function Navbar() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error handled in context
    }
  };

  if (!user) return null;

  return (
    <nav className="navbar bg-base-100 border-b border-base-200 px-4 py-2">
      {/* Left: Profile pic + name */}
      <div className="navbar-start">
        <div className="flex items-center gap-3">
          {user.photoURL ? (
            <img
              src={user.photoURL}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">
                {user.displayName?.charAt(0).toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div className="hidden sm:block">
            <p className="font-semibold text-base-content leading-tight">
              {user.displayName || "User"}
            </p>
          </div>
        </div>
      </div>

      {/* Center: Can be used for navigation links later */}
      <div className="navbar-center hidden lg:flex">
        {/* Reserved for future nav links */}
      </div>

      {/* Right: Email + Logout */}
      <div className="navbar-end">
        <div className="flex items-center gap-4">
          <span className="text-sm text-base-content/70 hidden sm:inline-block max-w-[200px] truncate">
            {user.email}
          </span>
          <button
            onClick={handleLogout}
            className="btn btn-ghost btn-sm gap-2 text-error hover:bg-error/10"
            aria-label="Logout"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
