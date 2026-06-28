import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
//import { faArrowRight, faCheck } from "@fortawesome/free-solid-svg-icons";
import { useChatBot } from "../../context/useChatBot";
import { CheckCircle } from "lucide-react";
import { useAuth } from "../../context/useAuth";

import { services, topFeatures, providerServices } from "./ServicesData";

export default function ServicesPage() {
  const { openChatBot } = useChatBot();
  const { user, isAuthenticated } = useAuth();

  // Determine visibility based on user role
  const isProvider = user?.role === "doctor" || user?.role === "nurse";
  const showPatientServices = !isAuthenticated || user?.role === "patient";
  const showProviderServices = !isAuthenticated || isProvider;

  return (
    <main className="min-h-screen bg-white text-[#1F2937] ">
      {/* Hero Section */}
      <section className="relative bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA] py-20 px-5 text-center">
        <div className="mx-auto max-w-7xl">
          <h1 className="mb-6 text-4xl font-bold md:text-5xl">
            {isProvider ? "Provider Hub & Tools" : "Our Healthcare Services"}
          </h1>

          <p className="mx-auto max-w-3xl text-xl leading-8 text-[#6B7280]">
            {isProvider
              ? "Manage your medical practice, configure scheduling, and handle patient requests with ease."
              : "Discover smart healthcare solutions designed to connect patients with doctors, nurses, and AI-powered medical guidance."}
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="bg-white px-5 py-16 border-b border-border sticky top-20 z-40">
        <div className="mx-auto grid max-w-7xl gap-8 text-center md:grid-cols-2 lg:grid-cols-4">
          {topFeatures.map((feature) => (
            <div key={feature.title}>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-teal-50 text-[#14B8A6]">
                {/* <FontAwesomeIcon icon={feature.icon} className="text-3xl" /> */}
                <FontAwesomeIcon icon={feature.icon} className="text-3xl" />
              </div>

              <h3 className="mb-2 text-lg font-semibold text-[#1F2937]">
                {feature.title}
              </h3>

              <p className="text-[#6B7280]">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-white px-5 py-20">
        <div className="mx-auto max-w-7xl">
          {/* Patient Services */}
          {showPatientServices && (
            <div className="space-y-20">

              {services.map((service, index) => {
                const isReverse = index % 2 === 1;

                return (
                  <div
                    key={service.title}
                    className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12"
                  >
                    {/* Image */}
                    <div className={isReverse ? "lg:order-2" : ""}>
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-80 w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className={isReverse ? "lg:order-1" : ""}>
                      <h2 className="mb-4 text-3xl font-bold text-[#1F2937]">
                        {service.title}
                      </h2>

                      <p className="mb-6 text-lg leading-8 text-[#6B7280]">
                        {service.description}
                      </p>

                      <div className="mb-7 space-y-3">
                        {service.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-white">
                              <CheckCircle className="h-8 w-8" />
                            </div>
                            <span className="text-[#1F2937]">{feature}</span>
                          </div>
                        ))}
                      </div>

                      {service.title === "AI Medical Assistant" ? (
                        <button
                          onClick={openChatBot}
                          className="group flex items-center gap-2 bg-primary text-white border-2 border-primary w-min font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
                        >
                          <span>Start Chatbot</span>
                        </button>
                      ) : (
                        <Link
                          to={
                            service.title === "Doctor Reservation"
                              ? "/doctors"
                              : service.title === "Nursing Care"
                                ? "/nurses"
                                : "/services"
                          }
                          className="group flex items-center gap-2 bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 w-min rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
                        >
                          <span>
                            {service.title === "Doctor Reservation"
                              ? "Go to Doctors"
                              : service.title === "Nursing Care"
                                ? "Go to Nurses"
                                : "Go to Home services"}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Spacer if both are shown */}
          {showPatientServices && showProviderServices && (
            <div className="my-24 border-t border-gray-200"></div>
          )}

          {/* Provider Services */}
          {showProviderServices && (
            <div className="space-y-20">

              {providerServices.map((service, index) => {
                const isReverse = index % 2 === 1;

                return (
                  <div
                    key={service.title}
                    className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12"
                  >
                    {/* Image */}
                    <div className={isReverse ? "lg:order-2" : ""}>
                      <div className="overflow-hidden rounded-2xl shadow-xl">
                        <img
                          src={service.image}
                          alt={service.title}
                          className="h-80 w-full object-cover"
                        />
                      </div>
                    </div>

                    {/* Content */}
                    <div className={isReverse ? "lg:order-1" : ""}>
                      <h2 className="mb-4 text-3xl font-bold text-[#1F2937]">
                        {service.title}
                      </h2>

                      <p className="mb-6 text-lg leading-8 text-[#6B7280]">
                        {service.description}
                      </p>

                      <div className="mb-7 space-y-3">
                        {service.features.map((feature) => (
                          <div key={feature} className="flex items-center gap-3">
                            <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-white">
                              <CheckCircle className="h-8 w-8" />
                            </div>
                            <span className="text-[#1F2937]">{feature}</span>
                          </div>
                        ))}
                      </div>

                      <Link
                        to="/dashboard"
                        className="group flex items-center gap-2 bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 w-min rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
                      >
                        <span>Go to Dashboard</span>
                      </Link>
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

