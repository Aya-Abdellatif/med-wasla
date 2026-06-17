import { useState, useEffect, useRef } from "react";
import { LogOut, CalendarDays, UserCircle } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { AppointmentTypeModal } from "../booking/AppointmentTypeModal";
import { useAuth } from "../../context/useAuth";
import { getSpecialistDisplayName } from "../../../utils/displayName";
import { showInfo } from "../../../utils/toast";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [active, setActive] = useState<string | null>(null);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isFirstClick, setIsFirstClick] = useState(true);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isDoctor = user?.role === "doctor" || user?.role === "nurse";
  const displayName = getSpecialistDisplayName(user?.name);

  const navLinks = isDoctor
    ? [
        { name: "Home", path: "/home" },
        { name: "About", path: "/about" },
        { name: "Contact", path: "/contact" },
        { name: "Dashboard", path: "/dashboard" },
      ]
    : [
        { name: "Home", path: "/home" },
        { name: "Services", path: "/services" },
        { name: "Doctors", path: "/doctors" },
        { name: "Nurses", path: "/nurses" },
        { name: "About", path: "/about" },
        { name: "Contact Us", path: "/contact" },
      ];

  const containerRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<Record<string, HTMLElement | null>>({});

  useEffect(() => {
    if (!active) return;
    const el = linksRef.current[active];
    const container = containerRef.current;
    if (el && container) {
      const elRect = el.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();
      setUnderlineStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
      });
    }
  }, [active]);

  const handleLinkClick = (name: string) => {
    if (active !== null) {
      setIsFirstClick(false);
    }
    setActive(name);
  };

  const handleLogoClick = () => {
    setActive(null);
    setIsFirstClick(true);
  };

  const handleLogout = () => {
    logout();
    showInfo("Logged out successfully", { userName: user?.name });
    navigate("/");
  };

  return (
    <>
      <nav className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-20 items-center gap-6">
            <Link
              to="/home"
              onClick={handleLogoClick}
              className="flex items-center gap-3 shrink-0 cursor-pointer group"
            >
              <img
                src="src/assets/logo.png"
                alt="Logo"
                className="w-10 h-10 transition-transform duration-300 group-hover:scale-105"
              />
              <span className="text-3xl font-medium tracking-tight">
                <span className="text-fg">Med</span>
                <span className="text-primary font-bold">Wasla</span>
              </span>
            </Link>

            <div className="hidden xl:block h-6 w-px bg-border shrink-0" />

            <div
              ref={containerRef}
              className="hidden xl:flex items-center justify-center gap-1 flex-1 relative h-full"
            >
              {active && (
                <div
                  className={`absolute bottom-0 h-0.5 bg-primary rounded-full transition-all ease-out ${
                    isFirstClick ? "duration-0" : "duration-300"
                  }`}
                  style={{
                    left: `${underlineStyle.left}px`,
                    width: `${underlineStyle.width}px`,
                  }}
                />
              )}
              {navLinks.map(({ name, path }) => (
                <Link
                  key={name}
                  to={path}
                  ref={(el) => {
                    linksRef.current[name] = el;
                  }}
                  onClick={() => handleLinkClick(name)}
                  className={`px-4 py-2 text-lg font-semibold tracking-wide transition-all duration-300 ease-in-out ${
                    active === name
                      ? "text-primary"
                      : "text-fg-muted hover:text-fg hover:scale-[1.02]"
                  }`}
                >
                  {name}
                </Link>
              ))}
            </div>

            <div className="hidden xl:flex items-center gap-4 shrink-0">
              {isDoctor && displayName && (
                <div className="flex items-center gap-2 text-lg font-semibold text-fg px-3 py-1.5 rounded-full bg-muted">
                  <UserCircle className="h-6 w-6 text-primary shrink-0" strokeWidth={2} />
                  <span>{displayName}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-lg font-semibold text-fg-muted hover:text-red-500 transition-colors duration-300 cursor-pointer"
              >
                <LogOut className="h-5 w-5" strokeWidth={2.5} />
                Logout
              </button>
              {!isDoctor && (
                <button
                  onClick={() => setIsAppointmentModalOpen(true)}
                  className="group flex items-center gap-2 bg-primary text-white border-2 border-primary font-bold text-lg px-6 py-3 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md"
                >
                  <CalendarDays
                    className="h-5 w-5 text-brand-teal group-hover:text-primary transition-colors duration-300"
                    strokeWidth={2.5}
                  />
                  Book Appointment
                </button>
              )}
            </div>

            <div className="xl:hidden ml-auto">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-primary cursor-pointer transition-colors duration-300 hover:text-primary/80"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="xl:hidden bg-muted border-t border-border px-4 py-4 space-y-2">
            {navLinks.map(({ name, path }) => (
              <Link
                key={name}
                to={path}
                onClick={() => {
                  handleLinkClick(name);
                  setIsOpen(false);
                }}
                className={`block text-xl font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 ease-in-out ${
                  active === name
                    ? "text-primary bg-primary/10"
                    : "text-fg-muted hover:text-fg hover:bg-white pl-6"
                }`}
              >
                {name}
              </Link>
            ))}
            <div className="pt-3 border-t border-border space-y-3">
              {isDoctor && displayName && (
                <div className="flex items-center gap-2 text-lg font-semibold text-fg px-4 py-2 rounded-lg bg-white">
                  <UserCircle className="h-6 w-6 text-primary shrink-0" strokeWidth={2} />
                  <span>{displayName}</span>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full text-xl font-semibold text-fg-muted hover:text-red-500 px-4 py-2.5 rounded-lg transition-colors duration-300 cursor-pointer"
              >
                <LogOut className="h-5 w-5" strokeWidth={2.5} />
                Logout
              </button>
              {!isDoctor && (
                <button
                  onClick={() => setIsAppointmentModalOpen(true)}
                  className="group flex items-center justify-center gap-2 w-full bg-primary text-white border-2 border-primary font-bold text-base px-4 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 hover:bg-transparent hover:text-primary cursor-pointer"
                >
                  <CalendarDays
                    className="h-5 w-5 text-brand-teal group-hover:text-primary transition-colors duration-300"
                    strokeWidth={2.5}
                  />
                  Book Appointment
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
      <AppointmentTypeModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
