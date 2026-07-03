import {
  CalendarDays,
  Phone,
  Mail,
  MapPin,
  LayoutDashboard,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Logo from "/src/assets/LogoFooter.png";
import { useAuth } from "../../context/useAuth";
import { useState } from "react";
import {
  canBookAppointments,
  handleBookClick,
} from "../../../utils/bookingAccess";
import { AppointmentTypeModal } from "../booking/AppointmentTypeModal";

function Footer() {
  const { t } = useTranslation(["footer", "common"]);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const showBooking = canBookAppointments(user);
  const openBooking = () => setIsAppointmentModalOpen(true);
  const onBookClick = () => handleBookClick(user, navigate, openBooking);

  const companyLinks = [
    { labelKey: "footer:links.about", path: "/about" },
    { labelKey: "footer:links.services", path: "/services" },
    { labelKey: "footer:links.doctors", path: "/doctors" },
    { labelKey: "footer:links.nurses", path: "/nurses" },
    { labelKey: "footer:links.careers", path: "#" },
  ];

  const supportLinks = [
    { labelKey: "footer:links.helpCenter", path: "#" },
    ...(showBooking
      ? [{ labelKey: "footer:links.bookAppointment", onClick: onBookClick }]
      : []),
    { labelKey: "footer:links.emergency", path: "/contact" },
    { labelKey: "footer:links.terms", path: "#" },
    { labelKey: "footer:links.privacy", path: "#" },
  ];

  return (
    <footer className="bg-fg text-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src={Logo}
                alt={t("common:brand.logoAlt")}
                className="w-20 h-17 -me-6 transition-transform duration-300"
              />
              <span className="text-2xl font-medium tracking-tight text-white">
                <span>{t("common:brand.med")}</span>
                <span className="text-primary font-bold">{t("common:brand.wasla")}</span>
              </span>
            </div>
            <p className="text-base text-white/80 leading-relaxed">
              {t("footer:tagline")}
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300" aria-label="Facebook">
                <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300" aria-label="Twitter">
                <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300" aria-label="LinkedIn">
                <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a href="#" className="text-white/70 hover:text-primary transition-colors duration-300" aria-label="Instagram">
                <svg className="h-5 w-5 fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
              {t("footer:sections.company")}
            </h3>
            <ul className="space-y-3">
              {companyLinks.map(({ labelKey, path }) => (
                <li key={labelKey}>
                  <button
                    type="button"
                    onClick={() => navigate(path)}
                    className="text-base font-semibold text-white/70 hover:text-primary transition-all duration-300 block hover:translate-x-1 rtl:hover:-translate-x-1 text-start"
                  >
                    {t(labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
              {t("footer:sections.support")}
            </h3>
            <ul className="space-y-3">
              {supportLinks.map(({ labelKey, path, onClick }) => (
                <li key={labelKey}>
                  <button
                    type="button"
                    onClick={() => {
                      if (onClick) onClick();
                      else if (path) navigate(path);
                    }}
                    className="text-base font-semibold text-white/70 hover:text-primary transition-all duration-300 block hover:translate-x-1 rtl:hover:-translate-x-1 text-start"
                  >
                    {t(labelKey)}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
              {t("footer:sections.contact")}
            </h3>
            <div className="space-y-3 text-base font-semibold text-white/80">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>{t("footer:contact.phone")}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>{t("footer:contact.email")}</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>{t("footer:contact.location")}</span>
              </div>
            </div>

            <div className="pt-2">
              {showBooking ? (
                <button
                  type="button"
                  onClick={onBookClick}
                  className="group flex items-center justify-center gap-2 w-full bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md"
                >
                  <CalendarDays className="h-5 w-5 stroke-white group-hover:stroke-primary transition-colors duration-300" strokeWidth={2.5} />
                  {t("footer:actions.book")}
                </button>
              ) : user?.role === "doctor" || user?.role === "nurse" ? (
                <button
                  type="button"
                  onClick={() => navigate("/dashboard")}
                  className="group flex items-center justify-center gap-2 w-full bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md"
                >
                  <LayoutDashboard className="h-5 w-5 stroke-white group-hover:stroke-primary transition-colors duration-300" strokeWidth={2.5} />
                  {t("footer:actions.dashboard")}
                </button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-white/60 text-center sm:text-start">
            {t("footer:copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex items-center gap-6 text-sm font-semibold text-white/60">
            <a href="#" className="hover:text-primary transition-colors">
              {t("footer:links.privacy")}
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              {t("footer:links.termsOfUse")}
            </a>
          </div>
        </div>
      </div>
      <AppointmentTypeModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </footer>
  );
}

export default Footer;
