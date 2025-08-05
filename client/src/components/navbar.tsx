import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("darkMode");
    if (stored) {
      setIsDark(JSON.parse(stored));
    }
  }, []);

  const toggleDarkMode = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("darkMode", JSON.stringify(newValue));
    document.documentElement.classList.toggle("dark", newValue);
  };

  return (
    <nav className="relative z-50 glass-morphism border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-base sm:text-lg font-bold">💰</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-bold gradient-text">
                SplitSmart
              </h1>
              <p className="text-xs text-gray-400 hidden sm:block">Group Expense Tracker</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleDarkMode}
              className="glass-morphism hover:glass-morphism-purple transition-all duration-300 p-2"
            >
              {isDark ? <Moon className="h-4 w-4 text-purple-400" /> : <Sun className="h-4 w-4 text-yellow-400" />}
            </Button>
            
            <div className="flex items-center space-x-2">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-xs sm:text-sm font-semibold">RS</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-300 hidden sm:inline">Raushan Singh</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
