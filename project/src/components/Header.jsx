import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Home, List, User, LogIn, UserPlus, LogOut } from "lucide-react";
import { AuthContext } from "../AuthContext";

const Header = () => {
  const { isLoggedIn, logout } = useContext(AuthContext);

  return (
    <header className="fixed top-0 left-0 w-full bg-green-600 text-white shadow-md z-50">
      <div className="container mx-auto flex justify-between items-center py-4 px-6">
        {/* Logo and Title */}
        <div className="flex items-center space-x-3">
          <img src="/img/logo.png" alt="Logo" className="h-8 w-8" />
          <h1 className="text-2xl font-bold">
            <NavLink
              to="/"
              className="hover:text-green-300 transition-colors duration-200"
              aria-label="Go to homepage"
            >
              SmartVote
            </NavLink>
          </h1>
        </div>

        {/* Navigation Links */}
        <nav className="flex items-center space-x-6">
          <NavLink
            to="/"
            className={({ isActive }) =>
              isActive
                ? "text-green-300 flex items-center py-2 px-2"
                : "hover:text-green-300 flex items-center py-2 px-2 transition-colors duration-200"
            }
            aria-label="Home"
          >
            <Home className="mr-1" size={18} />
            Home
          </NavLink>
          <NavLink
            to="/elections"
            className={({ isActive }) =>
              isActive
                ? "text-green-300 flex items-center py-2 px-2"
                : "hover:text-green-300 flex items-center py-2 px-2 transition-colors duration-200"
            }
            aria-label="Elections"
          >
            <List className="mr-1" size={18} />
            Elections
          </NavLink>
          {isLoggedIn ? (
            <>
              <NavLink
                to="/profile"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-300 flex items-center py-2 px-2"
                    : "hover:text-green-300 flex items-center py-2 px-2 transition-colors duration-200"
                }
                aria-label="Profile"
              >
                <User className="mr-1" size={18} />
                Profile
              </NavLink>
              <button
                onClick={logout}
                className="hover:text-green-300 flex items-center py-2 px-2 transition-colors duration-200"
                aria-label="Logout"
              >
                <LogOut className="mr-1" size={18} />
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-300 flex items-center py-2 px-2"
                    : "hover:text-green-300 flex items-center py-2 px-2 transition-colors duration-200"
                }
                aria-label="Login"
              >
                <LogIn className="mr-1" size={18} />
                Login
              </NavLink>
              <NavLink
                to="/signup"
                className={({ isActive }) =>
                  isActive
                    ? "text-green-300 flex items-center py-2 px-2"
                    : "hover:text-green-300 flex items-center py-2 px-2 transition-colors duration-200"
                }
                aria-label="Sign up"
              >
                <UserPlus className="mr-1" size={18} />
                Signup
              </NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
