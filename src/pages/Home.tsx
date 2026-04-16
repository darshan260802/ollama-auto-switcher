import { useAuth } from "../context/AuthContext";

export function Home() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Error handled in context
    }
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-base-100 p-4 gap-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-2">Hello World</h1>
        <p className="text-base-content/70">You are signed in</p>
      </div>

      {user && (
        <div className="card bg-base-200 shadow-md">
          <div className="card-body items-center text-center">
            {user.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                className="w-16 h-16 rounded-full mb-3"
              />
            )}
            <div className="space-y-1">
              <p className="font-semibold text-lg">{user.displayName}</p>
              <p className="text-base-content/70 text-sm">{user.email}</p>
            </div>
          </div>
        </div>
      )}

      <button onClick={handleLogout} className="btn btn-error btn-outline">
        Logout
      </button>
    </div>
  );
}
