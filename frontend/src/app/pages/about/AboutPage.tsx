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



// ── Team data ── swap placeholders with real info
const team = [
  {
    name: "Dr. Sarah Mitchell",
    title: "Chief Medical Officer",
    linkedin: "https://linkedin.com/in/placeholder",
    whatsapp: "https://wa.me/1234567890",
    initials: "SM",
    color: "#14B8A6",
  },
  {
    name: "Dr. James Carter",
    title: "Head of Surgery",
    linkedin: "https://linkedin.com/in/placeholder",
    whatsapp: "https://wa.me/1234567890",
    initials: "JC",
    color: "#0F766E",
  },
  {
    name: "Dr. Aisha Nour",
    title: "Director of Internal Medicine",
    linkedin: "https://linkedin.com/in/placeholder",
    whatsapp: "https://wa.me/1234567890",
    initials: "AN",
    color: "#2DD4BF",
  },
  {
    name: "Dr. Omar Hassan",
    title: "Cardiology Specialist",
    linkedin: "https://linkedin.com/in/placeholder",
    whatsapp: "https://wa.me/1234567890",
    initials: "OH",
    color: "#14B8A6",
  },
  {
    name: "Dr. Elena Vasquez",
    title: "Head of Paediatrics",
    linkedin: "https://linkedin.com/in/placeholder",
    whatsapp: "https://wa.me/1234567890",
    initials: "EV",
    color: "#0F766E",
  },
  {
    name: "Dr. Liam Chen",
    title: "Orthopaedic Surgeon",
    linkedin: "https://linkedin.com/in/placeholder",
    whatsapp: "https://wa.me/1234567890",
    initials: "LC",
    color: "#2DD4BF",
  },
];

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

      {/* ── Team — 6 cards ── */}
      <section className="bg-[#F9FAFB] px-5 py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 max-w-xl">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#14B8A6]">
              The people behind your care
            </p>
            <h3 className="mt-3 text-4xl font-bold leading-tight text-[#1F2937]">
              Meet Our Team
            </h3>
            <p className="mt-4 text-base leading-8 text-[#6B7280]">
              100+ board-certified professionals, united by one goal: your wellbeing.
            </p>
          </div>

 <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {team.map((member) => (
              <article
                key={member.name}
                className="flex flex-col rounded-2xl border border-[#E5E7EB] bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-teal-100/50"
              >
                {/* Avatar */}
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white shadow-md"
                  style={{ backgroundColor: member.color }}
                >
                  {member.initials}
                </div>

                <h4 className="mt-5 text-lg font-semibold text-[#1F2937]">
                  {member.name}
                </h4>

                <p className="mt-1 text-sm text-[#14B8A6]">{member.title}</p>

                {/* Divider */}
                <div className="my-5 h-px bg-[#F3F4F6]" />

                {/* Links */}
                <div className="mt-auto flex items-center gap-4">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors duration-200 hover:border-[#0A66C2] hover:text-[#0A66C2]"
                  >
                    {/* <FontAwesomeIcon icon={faLinkedin} className="text-base" /> */}
                    LinkedIn
                  </a>

                  <a
                    href={member.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-lg border border-[#E5E7EB] px-3 py-2 text-xs font-medium text-[#6B7280] transition-colors duration-200 hover:border-[#25D366] hover:text-[#25D366]"
                  >
                    {/* <FontAwesomeIcon icon={faWhatsapp} className="text-base" /> */}
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