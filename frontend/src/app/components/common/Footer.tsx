import { CalendarDays, Phone, Mail, MapPin } from "lucide-react";

function Footer() {
  const companyLinks = [
    "About Us",
    "Our Services",
    "Doctors Directory",
    "Nurses Directory",
    "Careers",
  ];
  const supportLinks = [
    "Help Center",
    "Book an Appointment",
    "Emergency Support",
    "Terms of Service",
    "Privacy Policy",
  ];

  return (
    <footer className="bg-[#1D3BA5] text-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)] mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="src/assets/Logo.png"
                alt="Logo"
                className="w-20 h-17 -mr-6 transition-transform duration-300"
              />
              <span className="text-2xl font-medium tracking-tight text-white">
                <span>Med</span>
                <span className="text-primary font-bold">Wasla</span>
              </span>
            </div>
            <p className="text-base text-white/80 leading-relaxed">
              Connecting patients with top-tier healthcare professionals,
              clinics, and nurses seamlessly. Your health, our priority.
            </p>

            <div className="flex items-center gap-4 pt-2">
              <a
                href="#"
                className="text-white/70 hover:text-primary transition-colors duration-300"
              >
                <svg
                  className="h-5 w-5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-primary transition-colors duration-300"
              >
                <svg
                  className="h-5 w-5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-primary transition-colors duration-300"
              >
                <svg
                  className="h-5 w-5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                  <rect x="2" y="9" width="4" height="12" />
                  <circle cx="4" cy="4" r="2" />
                </svg>
              </a>
              <a
                href="#"
                className="text-white/70 hover:text-primary transition-colors duration-300"
              >
                <svg
                  className="h-5 w-5 fill-none stroke-current"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
              MedWasla
            </h3>
            <ul className="space-y-3">
              {companyLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-base font-semibold text-white/70 hover:text-primary transition-all duration-300 block hover:translate-x-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
              Support
            </h3>
            <ul className="space-y-3">
              {supportLinks.map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-base font-semibold text-white/70 hover:text-primary transition-all duration-300 block hover:translate-x-1"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-bold text-white mb-4 tracking-wide">
              Contact Us
            </h3>
            <div className="space-y-3 text-base font-semibold text-white/80">
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-primary shrink-0" />
                <span>+20 123 456 7890</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-primary shrink-0" />
                <span>support@medwasla.com</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-primary shrink-0" />
                <span>Alexandria, Egypt</span>
              </div>
            </div>

            <div className="pt-2">
              <button className="group flex items-center justify-center gap-2 w-full bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2.5 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md">
                <CalendarDays
                  className="h-5 w-5 stroke-white group-hover:stroke-primary transition-colors duration-300"
                  strokeWidth={2.5}
                />
                Book Appointment
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-semibold text-white/60 text-center sm:text-left">
            &copy; {new Date().getFullYear()} MedWasla. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm font-semibold text-white/60">
            <a href="#" className="hover:text-primary transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-primary transition-colors">
              Terms of Use
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
