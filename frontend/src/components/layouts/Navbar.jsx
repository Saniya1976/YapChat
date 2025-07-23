"use client"
import React from "react"
import { Navigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { Home, TrendingUp, TrendingDown, LogOut, Sun, Moon, Menu, X } from "lucide-react"

const Navbar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark"
  })
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  const toggleTheme = () => setDarkMode((prev) => !prev)
  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev)

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/login")
  }

  const navLinks = [
    { path: "/dashboard", label: "Dashboard", icon: Home },
    { path: "/income", label: "Income", icon: TrendingUp },
    { path: "/expense", label: "Expense", icon: TrendingDown },
  ]

  const isActiveLink = (path) => location.pathname === path

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo Section */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <img src="/assets/images/logo.png" alt="Expenzo Logo" className="w-8 h-8 rounded-lg shadow-sm" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                  Expenzo
                </h1>
              </div>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navLinks.map((link) => {
                  const IconComponent = link.icon
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-2 group ${
                        isActiveLink(link.path)
                          ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white hover:scale-105"
                      }`}
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{link.label}</span>
                    </Link>
                  )
                })}
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              {/* Theme Toggle Button */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105 group"
                aria-label="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
                ) : (
                  <Moon className="w-4 h-4 group-hover:rotate-12 transition-transform duration-300" />
                )}
              </button>

              {/* Desktop Logout Button */}
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 hover:scale-105 group"
              >
                <LogOut className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                <span>Logout</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-lg bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 transition-all duration-200 hover:scale-105"
                aria-label="Toggle mobile menu"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5 rotate-90 transition-transform duration-200" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        <div
          className={`md:hidden transition-all duration-300 ease-in-out ${
            isMobileMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-700 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => {
                const IconComponent = link.icon
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200 group ${
                      isActiveLink(link.path)
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 group-hover:scale-110 transition-transform duration-200" />
                    <span>{link.label}</span>
                  </Link>
                )
              })}

              {/* Mobile Logout */}
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 group"
              >
                <LogOut className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Spacer to prevent content from hiding behind fixed navbar */}
      <div className="h-16"></div>
    </>
  )
}

export default Navbar
