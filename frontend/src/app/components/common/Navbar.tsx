import { useState, useEffect, useRef } from "react";
import {
  LogOut,
  CalendarDays,
  UserCircle,
  LogIn,
  UserPlus,
  User,
  ChevronDown,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AppointmentTypeModal } from "../booking/AppointmentTypeModal";
import { useAuth } from "../../context/useAuth";
import { getSpecialistDisplayName } from "../../../utils/displayName";
import { showInfo } from "../../../utils/toast";
import {
  canBookAppointments,
  handleBookClick,
} from "../../../utils/bookingAccess";
import Logo from "../../../assets/logo.png";

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [underlineStyle, setUnderlineStyle] = useState({ left: 0, width: 0 });
  const [isFirstActivation, setIsFirstActivation] = useState(true);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const isDoctor = user?.role === "doctor" || user?.role === "nurse";
  const displayName = getSpecialistDisplayName(user?.name);
  const navUserName = isDoctor ? displayName : user?.name;

  const doctorLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Dashboard", path: "/dashboard" },
  ];
  const patientLinks = [
    { name: "Home", path: "/" },
    { name: "Services", path: "/services" },
    { name: "Doctors", path: "/doctors" },
    { name: "Nurses", path: "/nurses" },
    { name: "About", path: "/about" },
    { name: "Contact Us", path: "/contact" },
  ];
  const baseLinks = isDoctor ? doctorLinks : patientLinks;

  const navLinks = isAuthenticated
    ? [
        ...baseLinks,
        { name: "Profile", path: "/profile" },
        { name: "Appointments", path: "/appointments" },
      ]
    : baseLinks;

  const desktopNavLinks = navLinks.filter(
    (link) => link.name !== "Profile" && link.name !== "Appointments",
  );

  const active =
    navLinks.find((link) => link.path === location.pathname)?.name ?? null;
  const containerRef = useRef<HTMLDivElement | null>(null);
  const linksRef = useRef<Record<string, HTMLElement | null>>({});
  const profileRef = useRef<HTMLDivElement | null>(null);

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
    if (isFirstActivation) setIsFirstActivation(false);
  }, [active, isFirstActivation]);

  useEffect(() => {
    if (!isProfileOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isProfileOpen]);

  const openBooking = () => setIsAppointmentModalOpen(true);
  const onBookClick = () => handleBookClick(user, navigate, openBooking);

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
              to="/"
              className="flex items-center shrink-0 cursor-pointer group"
            >
              <img
                src={Logo}
                alt="Logo"
                className="w-20 h-17 -mr-4 transition-transform duration-300"
              />
              <span className="text-3xl font-medium tracking-tight">
                <span className="text-fg">Med</span>
                <span className="text-primary font-bold">Wasla</span>
              </span>
            </Link>

            <div className="hidden lg:block h-6 w-px bg-border shrink-0" />

            <div
              ref={containerRef}
              className="hidden lg:flex items-center justify-center gap-1 flex-1 relative h-full"
            >
              {active && (
                <div
                  className={`absolute bottom-0 h-0.5 bg-primary rounded-full transition-all ease-out ${
                    isFirstActivation ? "duration-0" : "duration-300"
                  }`}
                  style={{
                    left: `${underlineStyle.left}px`,
                    width: `${underlineStyle.width}px`,
                  }}
                />
              )}
              {desktopNavLinks.map(({ name, path }) => (
                <Link
                  key={name}
                  to={path}
                  ref={(el) => {
                    linksRef.current[name] = el;
                  }}
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

            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {isAuthenticated && navUserName && (
                <div className="relative" ref={profileRef}>
                  <button
                    onClick={() => setIsProfileOpen((prev) => !prev)}
                    className="group flex items-center gap-2 bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
                  >
                    <User className="h-5 w-5" strokeWidth={2.5} />
                    {navUserName}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        isProfileOpen ? "rotate-180" : ""
                      }`}
                      strokeWidth={2.5}
                    />
                  </button>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 bg-white rounded-xl shadow-xl border border-border p-2 space-y-1 z-50">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 text-base font-semibold px-3 py-2 rounded-lg text-fg-muted hover:text-fg hover:bg-muted transition-all duration-200"
                      >
                        View Profile
                      </Link>
                      <Link
                        to="/appointments"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2 text-base font-semibold px-3 py-2 rounded-lg text-fg-muted hover:text-fg hover:bg-muted transition-all duration-200"
                      >
                        View Appointments
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="group flex items-center gap-2 bg-transparent text-primary border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-md whitespace-nowrap"
                >
                  <LogOut className="h-5 w-5" strokeWidth={2.5} />
                  Logout
                </button>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="group flex items-center gap-2 bg-transparent text-primary border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-md whitespace-nowrap"
                  >
                    <LogIn className="h-5 w-5" strokeWidth={2.5} />
                    Login
                  </Link>
                  <Link
                    to="/role"
                    className="group flex items-center gap-2 bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
                  >
                    <UserPlus className="h-5 w-5" strokeWidth={2.5} />
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <div className="lg:hidden ml-auto relative">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-primary cursor-pointer transition-colors duration-300 hover:text-primary/80"
                aria-label="Toggle menu"
              >
                {isOpen ? (
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="h-7 w-7"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                )}
              </button>

              {isOpen && (
                <div className="absolute right-0 top-12 w-72 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-xl border border-border p-4 space-y-2 z-50">
                  {navLinks.map(({ name, path }) => (
                    <Link
                      key={name}
                      to={path}
                      onClick={() => setIsOpen(false)}
                      className={`block text-base font-semibold px-4 py-2.5 rounded-lg transition-all duration-300 ease-in-out ${
                        active === name
                          ? "text-primary bg-primary/10"
                          : "text-fg-muted hover:text-fg hover:bg-muted"
                      }`}
                    >
                      {name}
                    </Link>
                  ))}
                  <div className="pt-3 border-t border-border space-y-3">
                    {isDoctor && displayName && (
                      <div className="flex items-center gap-2 text-base font-semibold text-fg px-4 py-2 rounded-lg bg-muted">
                        <UserCircle
                          className="h-5 w-5 text-primary shrink-0"
                          strokeWidth={2}
                        />
                        <span>{displayName}</span>
                      </div>
                    )}

                    {isAuthenticated ? (
                      <button
                        onClick={handleLogout}
                        className="group flex items-center justify-center gap-2 w-full bg-transparent text-primary border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-md whitespace-nowrap"
                      >
                        <LogOut className="h-5 w-5" strokeWidth={2.5} />
                        Logout
                      </button>
                    ) : (
                      <>
                        <Link
                          to="/login"
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center justify-center gap-2 w-full bg-transparent text-primary border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-primary hover:text-white hover:shadow-md whitespace-nowrap"
                        >
                          <LogIn className="h-5 w-5" strokeWidth={2.5} />
                          Login
                        </Link>
                        <Link
                          to="/role"
                          onClick={() => setIsOpen(false)}
                          className="group flex items-center justify-center gap-2 w-full bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
                        >
                          <UserPlus className="h-5 w-5" strokeWidth={2.5} />
                          Sign Up
                        </Link>
                      </>
                    )}

                    {canBookAppointments(user) && (
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          onBookClick();
                        }}
                        className="group flex items-center justify-center gap-2 w-full bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
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
            </div>
          </div>
        </div>
      </nav>
      <AppointmentTypeModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </>
  );
}

export default Navbar;
