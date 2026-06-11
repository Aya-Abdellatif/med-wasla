import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import { AppointmentTypeModal } from "../../components/booking/AppointmentTypeModal";
// import { faLinkedin, faWhatsapp } from "@fortawesome/free-brands-svg-icons";

import {
  CheckIcon,
  coreValues,
  missionVision,
  stats,
  UsersIcon,
  teamMembers,
  servicesHighlight,
} from "./AboutData";

const AboutPage = () => {
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  return (
    <main className="min-h-screen bg-[#FFFFFF] text-[#1F2937]">
      {/* Hero */}
      <section className="bg-linear-to-br from-[#E6FFFB] via-[#ECFEFF] to-[#F0FDFA] px-5 py-24 text-center">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-[3rem] font-bold leading-tight tracking-tight text-[#1F2937]">
            About HealthCarePlus
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-[1.25rem] font-normal leading-8 text-[#6B7280]">
            Dedicated to providing exceptional healthcare services with
            compassion, innovation, and excellence for over 25 years.
          </p>
        </div>
      </section>

      

      {/* Mission & Vision */}
      <section className="bg-[#FFFFFF] px-5 py-24">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-2">
          {missionVision.map((item) => (
            <article
              key={item.title}
              className={`${item.bg} rounded-3xl p-10`}
            >
              <div
                className={`${item.iconBg} flex h-20 w-20 items-center justify-center rounded-2xl text-white`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-[34px]" />
              </div>

              <h2 className="mt-8 text-[2.25rem] font-bold leading-tight text-[#1F2937]">
                {item.title}
              </h2>

              <p className="mt-6 text-[0.875rem] font-normal leading-8 text-[#6B7280]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* Core Values */}
      <section className="bg-[#F9FAFB] px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h3 className="text-[2.25rem] font-bold leading-tight tracking-tight text-[#1F2937]">
              Our Core Values
            </h3>

            <p className="mt-5 text-[1.25rem] font-normal leading-8 text-[#6B7280]">
              The principles that guide our commitment to exceptional healthcare.
            </p>
          </div>

          <div className="mt-20 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-[#E5E7EB] bg-[#FFFFFF] p-9 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-xl"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#E6FFFB] text-[#14B8A6]">
                  <FontAwesomeIcon icon={item.icon} className="text-[30px]" />
                </div>

                <h4 className="mt-9 text-[1.25rem] font-semibold leading-tight text-[#1F2937]">
                  {item.title}
                </h4>

                <p className="mt-5 text-[0.875rem] font-normal leading-7 text-[#6B7280]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="bg-[#FFFFFF] px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center">
            <h3 className="text-[2.25rem] font-bold leading-tight tracking-tight text-[#1F2937]">
              Why Choose Med-Wasla?
            </h3>

            <p className="mt-5 text-[1.25rem] font-normal leading-8 text-[#6B7280]">
              Excellence, innovation, and patient care at the heart of everything we do.
            </p>
          </div>

          <div className="mt-20 grid gap-10 lg:grid-cols-3">
            {servicesHighlight.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border-2 border-[#E6FFFB] bg-gradient-to-br from-[#F0FDFA] to-[#FFFFFF] p-8 transition duration-300 hover:border-[#14B8A6] hover:shadow-lg"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-[#14B8A6]/10 text-[#14B8A6]">
                  <FontAwesomeIcon icon={item.icon} className="text-[28px]" />
                </div>

                <h4 className="mt-6 text-[1.25rem] font-bold text-[#1F2937]">
                  {item.title}
                </h4>

                <p className="mt-4 text-[0.875rem] font-normal leading-7 text-[#6B7280]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-linear-to-br from-[#E6FFFB] via-[#ECFEFF] to-[#F0FDFA] px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-20">
            <h3 className="text-[2.25rem] font-bold leading-tight tracking-tight text-[#1F2937]">
              Meet Our Medical Team
            </h3>

            <p className="mt-5 text-[1.25rem] font-normal leading-8 text-[#6B7280]">
              Six exceptional healthcare professionals dedicated to your wellness and recovery.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="group overflow-hidden rounded-2xl bg-white shadow-lg transition duration-500 hover:shadow-2xl"
              >
                {/* Image Container */}
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-[#E6FFFB] to-[#F0FDFA]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition duration-300 group-hover:opacity-100" />
                </div>

                {/* Content */}
                <div className="p-8">
                  <h4 className="text-[1.25rem] font-bold text-[#1F2937]">
                    {member.name}
                  </h4>

                  <p className="mt-2 text-[0.875rem] font-medium text-[#14B8A6]">
                    {member.role}
                  </p>

                  {/* Social Links */}
                  <div className="mt-6 flex gap-4">
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6FFFB] text-[#14B8A6] transition duration-300 hover:bg-[#14B8A6] hover:text-white"
                      title="LinkedIn"
                    >
                      {/* <FontAwesomeIcon icon={faLinkedin} className="text-[18px]" /> */}
                    </a>

                    <a
                      href={member.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-[#E6FFFB] text-[#14B8A6] transition duration-300 hover:bg-[#14B8A6] hover:text-white"
                      title="WhatsApp"
                    >
                      {/* <FontAwesomeIcon icon={faWhatsapp} className="text-[18px]" /> */}
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* CTA Section */}
          <div className="mt-20 rounded-2xl bg-white p-10 text-center shadow-lg">
            <h4 className="text-[1.75rem] font-bold text-[#1F2937]">
              Ready to Schedule an Appointment?
            </h4>

            <p className="mt-4 text-[1rem] text-[#6B7280]">
              Connect with our expert doctors and get the healthcare you deserve.
            </p>

            <button
              onClick={() => setIsAppointmentModalOpen(true)}
              className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#14B8A6] px-8 py-4 text-[1rem] font-semibold text-white transition duration-300 hover:bg-[#0F766E]"
            >
              <FontAwesomeIcon icon={UsersIcon} className="text-[20px]" />
              Book Appointment Now
            </button>
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