import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AppointmentTypeModal } from "../components/booking/AppointmentTypeModal";
import { useAuth } from "../context/useAuth";
import {
  canBookAppointments,
  handleBookClick,
  isSpecialistAccount,
} from "../../utils/bookingAccess";
import {
  Stethoscope,
  Bot,
  Bell,
  Heart,
  Zap,
  HeartPulse,
  CheckCircle,
  Star,
  ArrowRight,
  Phone,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CalendarDays,
} from "lucide-react";
import docImg from "/src/assets/doctors.avif";
import whyImg from "/src/assets/trust.jpg";
import mai from "/src/assets/mai.jpg";
import hend from "/src/assets/hend.jpg";
import hazem from "/src/assets/hazem.jpg";

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
  { icon: Stethoscope, key: "doctorBooking" },
  { icon: HeartPulse, key: "homeNursing" },
  { icon: Bot, key: "aiAssistant" },
  { icon: Bell, key: "appointmentReminders" },
] as const;

const reasons = [
  { icon: CheckCircle, key: "expertNetwork" },
  { icon: Zap, key: "instantMatching" },
  { icon: Heart, key: "patientCentered" },
  { icon: Phone, key: "availability247" },
] as const;

const reviews = [
  { key: "review1", rating: 5, img: mai },
  { key: "review2", rating: 5, img: hazem },
  { key: "review3", rating: 5, img: hend },
] as const;

function Home() {
  const { t } = useTranslation(["home"]);
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

  const active = reviews[currentReview];

  return (
    <div style={{ backgroundColor: "#f0fffe" }}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 flex flex-col gap-6">
          <span className="self-start flex items-center gap-1.5 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-sm font-semibold">
            <CheckCircle className="h-4 w-4 text-primary" strokeWidth={3} />
            {t("home:hero.badge")}
          </span>
          <h1 className="text-5xl font-black text-fg leading-tight">
            {t("home:hero.titleLine1")} <br />
            <span className="text-primary">
              {t("home:hero.titleHighlight")}
            </span>
          </h1>
          <p className="text-fg-muted text-lg leading-relaxed max-w-lg">
            {t("home:hero.description")}
          </p>
          <div className="flex items-center gap-4 flex-wrap">
            {showBooking && (
              <button
                onClick={onBookClick}
                className="group flex items-center gap-2 bg-primary hover:bg-transparent text-white hover:text-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 border-2 border-primary cursor-pointer"
              >
                <CalendarDays className="h-5 w-5 stroke-white group-hover:stroke-primary transition-colors duration-300" />
                {t("home:hero.bookAppointment")}
              </button>
            )}
            {showDashboardCta && (
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-2 bg-primary hover:bg-transparent text-white hover:text-primary font-bold px-6 py-3 rounded-xl transition-all duration-300 hover:-translate-y-0.5 border-2 border-primary cursor-pointer"
              >
                <LayoutDashboard className="h-5 w-5 stroke-white group-hover:stroke-primary transition-colors duration-300" />
                {t("home:hero.goToDashboard")}
              </button>
            )}
            <button
              onClick={() => navigate("/services")}
              className="flex items-center gap-2 text-fg font-semibold px-6 py-3 rounded-xl border-2 border-border hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              {t("home:hero.ourServices")}{" "}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
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
            <div className="absolute -bottom-5 start-[-1rem] bg-white rounded-2xl shadow-xl px-5 py-3.5 flex items-center gap-3 border border-border">
              <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Phone className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-bold text-fg">
                  {t("home:hero.support.title")}
                </p>
                <p className="text-xs text-fg-muted">
                  {t("home:hero.support.subtitle")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white border-y border-border py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-2 lg:grid-cols-4 gap-10">
          <Stat
            target={5000}
            suffix="+"
            label={t("home:stats.patientsServed")}
          />
          <Stat target={200} suffix="+" label={t("home:stats.expertDoctors")} />
          <Stat
            target={25}
            suffix="+"
            label={t("home:stats.yearsExperience")}
          />
          <Stat target={95} suffix="%" label={t("home:stats.successRate")} />
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-fg mb-3">
            {t("home:services.title")}
          </h2>
          <p className="text-fg-muted max-w-xl mx-auto">
            {t("home:services.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map(({ icon: Icon, key }) => (
            <div
              key={key}
              className="group border border-border rounded-2xl p-6 hover:border-primary hover:shadow-md hover:scale-[1.02] transition-all duration-300 hover:-translate-y-2 flex flex-col gap-4 bg-white"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                <Icon className="h-6 w-6 text-primary group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="font-bold text-fg">
                {t(`home:services.items.${key}.title`)}
              </h3>
              <p className="text-sm text-fg-muted leading-relaxed flex-1">
                {t(`home:services.items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/services")}
            className="flex items-center gap-2 mx-auto border-2 border-primary text-primary font-bold px-8 py-3 rounded-xl hover:bg-primary hover:text-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
          >
            {t("home:services.viewAll")}
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
              {t("home:why.title")}{" "}
              <span className="text-primary">
                {t("home:why.titleHighlight")}
              </span>
            </h2>
            <p className="text-fg-muted">{t("home:why.description")}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {reasons.map(({ icon: Icon, key }) => (
                <div key={key} className="flex gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-md font-semibold text-[#1F2937] ">
                      {t(`home:why.reasons.${key}.title`)}
                    </p>
                    <p className="text-xs text-fg-muted mt-0.5 leading-relaxed">
                      {t(`home:why.reasons.${key}.desc`)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <a
              onClick={() => navigate("/about")}
              className="self-start flex items-center gap-2 font-bold text-primary hover:gap-3 transition-all duration-200 cursor-pointer"
            >
              {t("home:why.learnMoreAboutUs")}{" "}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </a>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-black text-fg mb-3">
            {t("home:reviews.title")}
          </h2>
          <p className="text-fg-muted">{t("home:reviews.subtitle")}</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <div className="bg-white border border-border rounded-2xl p-8 flex flex-col gap-5 shadow-sm">
            <div className="flex gap-1">
              {Array.from({ length: active.rating }).map((_, i) => (
                <Star
                  key={i}
                  className="h-5 w-5 text-yellow-400 fill-yellow-400"
                />
              ))}
            </div>
            <p className="text-fg leading-relaxed text-lg">
              "{t(`home:reviews.items.${active.key}.text`)}"
            </p>
            <div className="flex items-center gap-3">
              <img
                src={active.img}
                alt={t(`home:reviews.items.${active.key}.name`)}
                className="h-11 w-11 rounded-full object-cover border-2 border-primary/20"
              />
              <div>
                <p className="font-bold text-fg">
                  {t(`home:reviews.items.${active.key}.name`)}
                </p>
                <p className="text-sm text-fg-muted">
                  {t(`home:reviews.items.${active.key}.role`)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={prev}
              className="h-9 w-9 rounded-full border-2 border-border hover:border-primary hover:text-primary flex items-center justify-center transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="h-5 w-5 rtl:rotate-180" />
            </button>
            {reviews.map((r, i) => (
              <button
                key={r.key}
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
              <ChevronRight className="h-5 w-5 rtl:rotate-180" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-primary py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center gap-6">
          <h2 className="text-4xl font-bold text-white">
            {t("home:cta.title")}
          </h2>
          <p className="text-white/80 max-w-lg text-lg">
            {showBooking
              ? t("home:cta.descriptionBooking")
              : t("home:cta.descriptionDashboard")}
          </p>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            {showBooking && (
              <button
                onClick={onBookClick}
                className="group flex items-center gap-2 bg-white text-primary border-2 border-white font-bold px-8 py-3 rounded-xl hover:bg-transparent hover:text-white hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                {t("home:hero.bookAppointment")}
              </button>
            )}
            {showDashboardCta && (
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-2 bg-white text-primary border-2 border-white font-bold px-8 py-3 rounded-xl hover:bg-transparent hover:text-white hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
              >
                <LayoutDashboard className="h-5 w-5" />
                {t("home:hero.goToDashboard")}
              </button>
            )}
            <button
              onClick={() => navigate("/contact")}
              className="group flex items-center gap-2 bg-white text-primary border-2 border-white font-bold px-8 py-3 rounded-xl hover:bg-transparent hover:text-white hover:border-white hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            >
              {t("home:cta.contactUs")}
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
