import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useTranslation } from "react-i18next";
import { useChatBot } from "../../context/useChatBot";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth";

import { services, topFeatures, providerServices } from "./ServicesData";

export default function ServicesPage() {
  const { t } = useTranslation(["services"]);
  const { openChatBot } = useChatBot();
  const { user, isAuthenticated } = useAuth();

  const isProvider = user?.role === "doctor" || user?.role === "nurse";
  const showPatientServices = !isAuthenticated || user?.role === "patient";
  const showProviderServices = !isAuthenticated || isProvider;

  const patientServicesList =
    showPatientServices && showProviderServices
      ? services.filter((service) => service.key !== "aiMedicalAssistant")
      : services;

  const chatbotButtonClass =
    "group flex items-center gap-2 bg-primary text-white border-2 border-primary w-min font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap";

  function renderServiceCta(serviceKey: string, providerMode = false) {
    if (serviceKey === "aiMedicalAssistant") {
      return (
        <button type="button" onClick={openChatBot} className={chatbotButtonClass}>
          <span>{t("services:cta.startChatbot")}</span>
        </button>
      );
    }

    if (providerMode) {
      return (
        <Link to="/dashboard" className={chatbotButtonClass}>
          <span>{t("services:cta.goToDashboard")}</span>
        </Link>
      );
    }

    const ctaLabel =
      serviceKey === "doctorReservation"
        ? t("services:cta.goToDoctors")
        : serviceKey === "nursingCare"
          ? t("services:cta.goToNurses")
          : t("services:cta.goToHomeServices");

    const ctaPath =
      serviceKey === "doctorReservation"
        ? "/doctors"
        : serviceKey === "nursingCare"
          ? "/nurses"
          : "/services";

    return (
      <Link to={ctaPath} className={chatbotButtonClass}>
        <span>{ctaLabel}</span>
      </Link>
    );
  }

  return (
    <main className="min-h-screen bg-white text-[#1F2937]">
      <section className="relative bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA] py-14 px-5 text-center">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-3xl font-bold md:text-4xl">
            {isProvider
              ? t("services:hero.providerTitle")
              : t("services:hero.patientTitle")}
          </h1>

          <p className="mx-auto max-w-3xl text-xl text-[#6B7280]">
            {isProvider
              ? t("services:hero.providerSubtitle")
              : t("services:hero.patientSubtitle")}
          </p>
        </div>
      </section>

      <section className="bg-white px-5 py-16 border-b border-border sticky top-20 z-40">
        <div className="mx-auto grid max-w-7xl gap-8 text-center md:grid-cols-2 lg:grid-cols-4">
          {topFeatures.map((feature) => (
            <div key={feature.key}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-[#14B8A6]">
                <FontAwesomeIcon icon={feature.icon} className="text-3xl" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-[#1F2937]">
                {t(`services:features.${feature.key}.title`)}
              </h3>

              <p className="text-[#6B7280]">
                {t(`services:features.${feature.key}.description`)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          {showPatientServices && (
            <div className="space-y-20">
              {patientServicesList.map((service, index) => {
                const isReverse = index % 2 === 1;

                return (
                  <div
                    key={service.key}
                    className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12"
                  >
                    <div className={isReverse ? "lg:order-2" : ""}>
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <img
                          src={service.image}
                          alt={t(`services:patient.${service.key}.title`)}
                          className="h-80 w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className={isReverse ? "lg:order-1" : ""}>
                      <h2 className="mb-4 text-3xl font-bold text-[#1F2937]">
                        {t(`services:patient.${service.key}.title`)}
                      </h2>

                      <p className="mb-6 text-lg leading-8 text-[#6B7280]">
                        {t(`services:patient.${service.key}.description`)}
                      </p>

                      <div className="mb-7 space-y-3">
                        {service.featureKeys.map((featureKey) => (
                          <div key={featureKey} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-white">
                              <CheckCircle className="h-8 w-8" />
                            </div>
                            <span className="text-[#1F2937]">
                              {t(
                                `services:patient.${service.key}.features.${featureKey}`,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {renderServiceCta(service.key)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {showPatientServices && showProviderServices && (
            <div className="my-24 border-t border-gray-200" />
          )}

          {showProviderServices && (
            <div className="space-y-20">
              {providerServices.map((service, index) => {
                const isReverse = index % 2 === 1;

                return (
                  <div
                    key={service.key}
                    className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12"
                  >
                    <div className={isReverse ? "lg:order-2" : ""}>
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <img
                          src={service.image}
                          alt={t(`services:provider.${service.key}.title`)}
                          className="h-80 w-full object-cover"
                        />
                      </div>
                    </div>

                    <div className={isReverse ? "lg:order-1" : ""}>
                      <h2 className="mb-4 text-3xl font-bold text-[#1F2937]">
                        {t(`services:provider.${service.key}.title`)}
                      </h2>

                      <p className="mb-6 text-lg leading-8 text-[#6B7280]">
                        {t(`services:provider.${service.key}.description`)}
                      </p>

                      <div className="mb-7 space-y-3">
                        {service.featureKeys.map((featureKey) => (
                          <div key={featureKey} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-white">
                              <CheckCircle className="h-8 w-8" />
                            </div>
                            <span className="text-[#1F2937]">
                              {t(
                                `services:provider.${service.key}.features.${featureKey}`,
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {renderServiceCta(service.key, true)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
