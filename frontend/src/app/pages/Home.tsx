import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AppointmentTypeModal } from "../components/booking/AppointmentTypeModal";
import { useAuth } from "../context/useAuth";
import { canBookAppointments, handleBookClick, isSpecialistAccount } from "../../utils/bookingAccess";
import {
  Heart,
  Zap,
  Shield,
  Baby,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  LayoutDashboard,
} from "lucide-react";
import docImg from "/src/assets/doctors.avif";
import whyImg from "/src/assets/trust.jpg";
import sarah from "/src/assets/sarah.avif";
import michael from "/src/assets/micheal.png";
import emily from "/src/assets/emily.jpg";
function useCounter(target: number, duration: number = 2000) {
  const [count, setCount] = useState<number>(0);

  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let startTimestamp: number | null = null;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const step = (timestamp: number) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min(
              (timestamp - startTimestamp) / duration,
              1,
            );

            setCount(Math.floor(progress * target));

            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [target, duration]);

  return [count, elementRef] as const;
}
interface StatProps {
  target: number;
  suffix?: string;
  label: string;
}

export function Stat({ target, suffix = "", label }: StatProps) {
  const [count, ref] = useCounter(target);

  return (
    <div ref={ref} className="text-center p-4">
      <h3 className="text-4xl font-bold text-primary mb-1">
        {count}
        {suffix}
      </h3>
      <p className="text-base font-semibold text-fg-muted tracking-wide">
        {label}
      </p>
    </div>
  );
}
const services = [
  {
    icon: Heart,
    title: "Cardiology",
    desc: "Connect with top cardiologists for comprehensive heart care using state-of-the-art technology.",
  },
  {
    icon: Zap,
    title: "Emergency Care",
    desc: "24/7 access to emergency medical professionals with rapid response and advanced support.",
  },
  {
    icon: Shield,
    title: "Primary Care",
    desc: "Book trusted general practitioners for health checkups and preventive care for all ages.",
  },
  {
    icon: Baby,
    title: "Pediatrics",
    desc: "Find specialized pediatric doctors in a child-friendly, caring environment.",
  },
];

const reviews = [
  {
    text: "MedWasla connected me with an amazing cardiologist within hours. The process was seamless and the doctor was exceptional.",
    name: "Sarah Johnson",
    role: "Patient",
    rating: 5,
    img: sarah,
  },
  {
    text: "Finding a specialist used to take weeks. Through MedWasla I had an appointment the same day. Truly outstanding service.",
    name: "Michael Chen",
    role: "Patient",
    rating: 5,
    img: michael,
  },
  {
    text: "I've used MedWasla for my whole family. The nurses they connected us with were professional, caring, and highly skilled.",
    name: "Emily Rodriguez",
    role: "Patient",
    rating: 5,
    img: emily,
  },
];

const reasons = [
  {
    icon: CheckCircle,
    title: "Expert Medical Network",
    desc: "Access to board-certified doctors and nurses with years of specialized experience.",
  },
  {
    icon: Zap,
    title: "Instant Matching",
    desc: "Our platform connects you to the right medical professional within minutes.",
  },
  {
    icon: Heart,
    title: "Patient-Centered",
    desc: "Personalized care tailored to your needs, all managed through one easy platform.",
  },
  {
    icon: Phone,
    title: "24/7 Availability",
    desc: "Round-the-clock access to healthcare professionals whenever you need them most.",
  },
];

function Home() {
  const [currentReview, setCurrentReview] = useState(0);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const showBooking = canBookAppointments(user);
  const showDashboardCta = isSpecialistAccount(user);

  const openBooking = () => setIsAppointmentModalOpen(true);
  const onBookClick = () => handleBookClick(user, navigate, openBooking);

  const prev = () =>
    setCurrentReview((i) => (i === 0 ? reviews.length - 1 : i - 1));
  const next = () =>
    setCurrentReview((i) => (i === reviews.length - 1 ? 0 : i + 1));

  return (
    <div style={{ backgroundColor: "#f0fffe" }}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6">
          <span className="self-start flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
            <CheckCircle className="h-4 w-4 text-primary" strokeWidth={3} />
            Trusted Healthcare Platform
          </span>
          <h1 className="text-5xl font-black text-fg leading-tight">
            Your Health, <br />
            <span className="text-primary">Our Priority</span>
          </h1>
          <p className="text-fg-muted text-lg leading-relaxed max-w-lg">
            Experience world-class healthcare by connecting with expert doctors
            and nurses. We're committed to your well-being every step of the
            way.
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {showBooking && (
              <button
                onClick={onBookClick}
                className="group flex items-center gap-2 bg-primary hover:bg-transparent text-white hover:text-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 border-2 border-primary cursor-pointer"
              >
                {/*<CalendarDays className="h-5 w-5 stroke-white group-hover:stroke-primary transition-colors duration-300" />*/}
                Book Appointment
              </button>
            )}
            {showDashboardCta && (
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-2 bg-primary hover:bg-transparent text-white hover:text-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 border-2 border-primary cursor-pointer"
              >
                <LayoutDashboard className="h-5 w-5 stroke-white group-hover:stroke-primary transition-colors duration-300" />
                Go to Dashboard
              </button>
            )}
            <button
              onClick={() => navigate("/services")}
              className="flex items-center gap-2 text-fg font-semibold px-6 py-3 rounded-xl border-2 border-border hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              Our Services {/*<ArrowRight className="h-4 w-4" />*/}
            </button>
          </div>
        </div>

        <div className="flex-1 relative flex justify-center">
          <div className="relative w-full max-w-2xl">
            <div className="rounded-3xl overflow-hidden bg-primary/10 aspect-4/3">
              <img
                src={docImg}
                alt="Doctor"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="absolute -bottom-5 -left-4 bg-white rounded-2xl shadow-xl px-5 py-3.5 flex items-center gap-3 border border-border">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-fg">24/7 Support</p>
                <p className="text-xs text-fg-muted">Always Available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-10">
          <Stat target={50000} suffix="+" label="Patients Served" />
          <Stat target={100} suffix="+" label="Expert Doctors" />
          <Stat target={25} suffix="+" label="Years Experience" />
          <Stat target={99} suffix="%" label="Success Rate" />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-fg mb-3">
            Our Medical Services
          </h2>
          <p className="text-fg-muted max-w-xl mx-auto">
            Comprehensive healthcare solutions tailored to meet your needs with
            excellence and compassion.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group border border-border rounded-2xl p-6 hover:border-primary hover:shadow-md transition-all duration-300 flex flex-col gap-4 bg-white"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-fg">{title}</h3>
              <p className="text-sm text-fg-muted leading-relaxed flex-1">
                {desc}
              </p>
              <a
                onClick={() => navigate("/services")}
                className="flex items-center gap-1 text-sm font-semibold text-primary hover:gap-2 transition-all duration-200 cursor-pointer"
              >
                Learn more <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/services")}
            className="flex items-center gap-2 mx-auto border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            View All Services {/*<ArrowRight className="h-4 w-4" />*/}
          </button>
        </div>
      </section>

      <section className="bg-white border-y border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col lg:flex-row gap-12 items-center">
          <div className="flex-1">
            <div className="rounded-3xl overflow-hidden aspect-square max-w-md mx-auto bg-primary/10">
              <img
                src={whyImg}
                alt="Why MedWasla"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-6">
            <h2 className="text-4xl font-black text-fg">
              Why Choose <span className="text-primary">MedWasla?</span>
            </h2>
            <p className="text-fg-muted">
              We bridge the gap between patients and healthcare professionals —
              making quality medical care accessible, fast, and personal.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reasons.map(({ icon: Icon, title, /*desc*/ }) => (
                <div key={title} className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-md font-semibold text-[#1F2937] mt-1">{title}</p>
                    {/*<p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
                      {desc}
                    </p>*/}
                  </div>
                </div>
              ))}
            </div>
            <a
              onClick={() => navigate("/about")}
              className="self-start flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all duration-200 cursor-pointer"
            >
              Learn More About Us <ArrowRight className="h-4 w-4" />
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-fg mb-3">
            What Our Patients Say
          </h2>
          <p className="text-fg-muted">
            Don't just take our word for it — hear from some of our satisfied
            patients.
          </p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
            <div className="flex gap-1">
              {Array.from({ length: reviews[currentReview].rating }).map(
                (_, i) => (
                  <Star
                    key={i}
                    className="h-5 w-5 text-yellow-400 fill-yellow-400"
                  />
                ),
              )}
            </div>
            <p className="text-fg leading-relaxed text-lg">
              "{reviews[currentReview].text}"
            </p>
            <div className="flex items-center gap-3">
              <img
                src={reviews[currentReview].img}
                alt={reviews[currentReview].name}
                className="h-11 w-11 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <p className="font-bold text-fg">
                  {reviews[currentReview].name}
                </p>
                <p className="text-sm text-fg-muted">
                  {reviews[currentReview].role}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="h-9 w-9 rounded-full border-2 border-border hover:border-primary hover:text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            {reviews.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentReview(i)}
                className={
                  "h-2.5 rounded-full transition-all duration-300 cursor-pointer " +
                  (i === currentReview
                    ? "w-6 bg-primary"
                    : "w-2.5 bg-border hover:bg-primary/40")
                }
              />
            ))}
            <button
              onClick={next}
              className="h-9 w-9 rounded-full border-2 border-border hover:border-primary hover:text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl font-bold text-white">
            Ready to Take Control of Your Health?
          </h2>
          <p className="text-white/80 max-w-lg text-lg">
            {showBooking
              ? "Book an appointment with our expert doctors today and experience healthcare excellence."
              : "Manage your schedule, appointments, and profile from your professional dashboard."}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {showBooking && (
              <button
                onClick={onBookClick}
                className="group flex items-center gap-2 bg-white text-primary border-2 border-white font-bold px-8 py-3 rounded-xl hover:bg-transparent hover:text-white hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                {/*<CalendarDays className="h-5 w-5" />*/}
                Book Appointment
              </button>
            )}
            {showDashboardCta && (
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-2 bg-white text-primary border-2 border-white font-bold px-8 py-3 rounded-xl hover:bg-transparent hover:text-white hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
              </button>
            )}
            <button
              onClick={() => navigate("/contact")}
              className="group flex items-center gap-2 bg-white text-primary border-2 border-white font-bold px-8 py-3 rounded-xl hover:bg-transparent hover:text-white hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              {/*<MessageCircle className="h-5 w-5" />*/}
              Contact Us
            </button>
          </div>

          {user?.role === "patient" && (
            <AppointmentTypeModal
              isOpen={isAppointmentModalOpen}
              onClose={() => setIsAppointmentModalOpen(false)}
            />
          )}
        </div>
      </section>
    </div>
  );
}

export default Home;
