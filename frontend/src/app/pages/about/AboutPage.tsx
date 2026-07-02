import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { AppointmentTypeModal } from "../../components/booking/AppointmentTypeModal";
import { faLinkedin, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import {
  coreValues,
  missionVision,
  servicesHighlight,
  teamMembers,
  stats,
} from "./AboutData";

const AboutPage = () => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#1F2937]">
      {/* Hero */}
      <section className="bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA] px-5 py-14 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
            About MedWasla
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-base md:text-lg font-normal leading-relaxed text-[#6B7280]">
            Your trusted healthcare platform for booking appointments, managing care, and connecting with medical professionals effortlessly.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      
      <section className="-mt-10 px-5 relative z-10">
        <div className="mx-auto max-w-7xl rounded-3xl border border-[#E5E7EB] bg-white p-6 shadow-lg md:p-10">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {stats.map((stat, idx) => (
              <div
                key={stat.label}
                className={`
            text-center p-5
            ${idx % 2 === 1 ? "border-l border-gray-100" : ""}
            ${idx > 1 ? "border-t border-gray-100" : ""}
            md:border-t-0
            md:border-l
            ${idx === 0 ? "md:border-l-0" : ""}
          `}
              >
                <p className="text-2xl font-extrabold text-[#14B8A6] md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280] md:text-xs">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Mission & Vision */}
      <section className="px-5 py-20">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-2">
          {missionVision.map((item) => (
            <article
              key={item.title}
              className={`${item.bg} rounded-3xl p-8 border border-teal-50 shadow-xs`}
            >
              <div className="flex items-center gap-4">
                <div
                  className={`${item.iconBg} flex h-12 w-12 items-center justify-center rounded-2xl text-white`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </div>

                <h2 className="text-2xl font-bold text-[#1F2937]">
                  {item.title}
                </h2>
              </div>

              <p className="mt-5 text-sm md:text-base font-normal leading-relaxed text-[#6B7280]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#f0fffe]/50 px-5 py-20 border-y border-[#ECFEFF]">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
              Our Core Values
            </h3>

            <p className="mt-4 text-base md:text-lg font-normal text-[#6B7280]">
              The principles that guide our commitment to exceptional healthcare.
            </p>
          </div>

          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] p-8 shadow-xs transition duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:border-teal-100"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E6FFFB] text-[#14B8A6]">
                  <FontAwesomeIcon icon={item.icon} className="text-xl" />
                </div>

                <h4 className="mt-6 text-lg font-bold text-[#1F2937]">
                  {item.title}
                </h4>

                <p className="mt-3 text-xs md:text-sm font-normal leading-relaxed text-[#6B7280]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#FFFFFF] px-5 py-20">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h3 className="text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
              Why Choose Med-Wasla?
            </h3>

            <p className="mt-4 text-base md:text-lg font-normal text-[#6B7280]">
              Excellence, innovation, and patient care at the heart of everything we do.
            </p>
          </div>

          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {servicesHighlight.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-[#E5E7EB] bg-linear-to-br from-[#F0FDFA]/50 to-[#FFFFFF] p-8 transition duration-300 hover:border-[#14B8A6]/30 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#14B8A6]/10 text-[#14B8A6]">
                  <FontAwesomeIcon icon={item.icon} className="text-lg" />
                </div>

                <h4 className="mt-5 text-lg font-bold text-[#1F2937]">
                  {item.title}
                </h4>

                <p className="mt-3 text-xs md:text-sm font-normal leading-relaxed text-[#6B7280]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-[#f0fffe]/50 px-5 py-20 border-t border-[#ECFEFF]">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#14B8A6]">
              The people behind your care
            </p>

            <h3 className="mt-3 text-3xl font-bold tracking-tight text-[#1F2937] sm:text-4xl">
              Meet Our Team
            </h3>

            <p className="mt-3 text-sm md:text-base leading-relaxed text-[#6B7280]">
              Our team is united by one goal: your wellbeing.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <article
                key={member.name}
                className="relative flex flex-col rounded-2xl border border-[#E5E7EB] bg-white px-8 pb-8 pt-16 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lg hover:shadow-teal-100/30 mt-12"
              >
                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-24 w-24 rounded-full border-4 border-[#CCFBF1] object-cover shadow-md bg-white"
                  />
                </div>

                <h4 className="text-center text-base font-semibold text-[#1F2937]">
                  {member.name}
                </h4>

                <p className="mt-1 text-center text-xs font-medium text-[#14B8A6]">
                  {member.role}
                </p>

                <div className="my-5 h-px bg-[#F3F4F6]" />

                <div className="mt-auto flex items-center justify-center gap-4">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors duration-200 hover:border-[#0A66C2] hover:text-[#0A66C2]"
                  >
                    <FontAwesomeIcon icon={faLinkedin} className="text-base" />
                    LinkedIn
                  </a>

                  <a
                    href={member.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors duration-200 hover:border-[#25D366] hover:text-[#25D366]"
                  >
                    <FontAwesomeIcon icon={faWhatsapp} className="text-base" />
                    WhatsApp
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <AppointmentTypeModal
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
      />
    </main>
  );
};

export default AboutPage;