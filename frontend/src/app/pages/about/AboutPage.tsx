import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  CheckIcon,
  coreValues,
  journey,
  missionVision,
  stats,
  UsersIcon,
} from "./AboutData";

const AboutPage = () => {
  return (
    <main className="min-h-screen bg-[#FFFFFF] font-['Inter'] text-[#1F2937]">
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#E6FFFB] via-[#ECFEFF] to-[#F0FDFA] px-5 py-24 text-center">
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

      {/* Stats */}
      <section className="bg-[#FFFFFF] px-5 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-10 text-center md:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label}>
              <h2 className="text-[3rem] font-bold leading-none text-[#14B8A6]">
                {item.value}
              </h2>

              <p className="mt-4 text-[0.875rem] font-normal leading-6 text-[#6B7280]">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Story */}
      <section className="bg-[#F9FAFB] px-5 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div>
            <h3 className="text-[2.25rem] font-bold leading-[1.2] tracking-tight text-[#1F2937]">
              Our Story
            </h3>

            <div className="mt-7 space-y-6 text-[1rem] font-normal leading-8 text-[#6B7280]">
              <p>
                HealthCarePlus was founded in 2000 with a simple yet powerful
                mission: to provide accessible, high-quality healthcare to our
                community. What began as a small clinic has grown into a
                comprehensive medical center serving thousands of patients each
                year.
              </p>

              <p>
                Our journey has been marked by continuous innovation, unwavering
                commitment to patient care, and a dedication to medical
                excellence. We've expanded our services, adopted cutting-edge
                technology, and built a team of exceptional healthcare
                professionals who share our vision.
              </p>

              <p>
                Today, we stand proud as a trusted healthcare provider, offering
                a full spectrum of medical services from preventive care to
                advanced surgical procedures. Our patients are at the heart of
                everything we do, and their trust inspires us to continuously
                improve and innovate.
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-3xl shadow-2xl shadow-gray-300/60">
            <img
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1200&q=80"
              alt="Healthcare professionals meeting"
              className="h-[420px] w-full object-cover"
            />
          </div>
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

      {/* Journey */}
      <section className="bg-[#FFFFFF] px-5 py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <h3 className="text-[2.25rem] font-bold leading-tight tracking-tight text-[#1F2937]">
              Our Journey
            </h3>

            <p className="mt-5 text-[1.25rem] font-normal leading-8 text-[#6B7280]">
              Milestones that have shaped our path to excellence in healthcare.
            </p>
          </div>

          <div className="relative mx-auto mt-20 max-w-5xl">
            <div className="absolute left-1/2 top-0 hidden h-full w-[3px] -translate-x-1/2 bg-[#CCFBF1] md:block" />

            <div className="space-y-20">
              {journey.map((item, index) => {
                const isLeft = index % 2 === 0;

                return (
                  <div
                    key={item.year}
                    className="relative grid items-start gap-10 md:grid-cols-2"
                  >
                    <div
                      className={`${
                        isLeft
                          ? "md:pr-20 md:text-right"
                          : "md:col-start-2 md:pl-20 md:text-left"
                      }`}
                    >
                      <div
                        className={`mb-4 flex items-center gap-4 ${
                          isLeft ? "md:justify-end" : "md:justify-start"
                        }`}
                      >
                        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#14B8A6] text-white shadow-lg shadow-teal-100">
                          <FontAwesomeIcon
                            icon={CheckIcon}
                            className="text-[24px]"
                          />
                        </div>

                        <h4 className="text-[1.5rem] font-bold leading-tight text-[#14B8A6]">
                          {item.year}
                        </h4>
                      </div>

                      <h5 className="text-[1.25rem] font-semibold leading-tight text-[#1F2937]">
                        {item.title}
                      </h5>

                      <p className="mt-4 text-[0.875rem] font-normal leading-8 text-[#6B7280]">
                        {item.description}
                      </p>
                    </div>

                    <span className="absolute left-1/2 top-6 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-[#14B8A6] md:block" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="bg-gradient-to-br from-[#E6FFFB] via-[#ECFEFF] to-[#F0FDFA] px-5 py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
          <div className="overflow-hidden rounded-3xl shadow-2xl shadow-gray-300/60">
            <img
              src="https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=1200&q=80"
              alt="Medical team"
              className="h-[420px] w-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-[2.25rem] font-bold leading-tight tracking-tight text-[#1F2937]">
              Meet Our Team
            </h3>

            <div className="mt-7 space-y-6 text-[0.875rem] font-normal leading-8 text-[#6B7280]">
              <p>
                Our healthcare team is comprised of over 100 board-certified
                physicians, nurses, and support staff who are passionate about
                providing exceptional care.
              </p>

              <p>
                Each member of our team brings expertise, dedication, and a
                commitment to your health and well-being. Together, we work
                collaboratively to ensure you receive comprehensive, coordinated
                care.
              </p>
            </div>

            <button className="mt-8 inline-flex items-center gap-3 rounded-xl bg-[#14B8A6] px-8 py-4 text-[1.25rem] font-semibold text-white transition duration-300 hover:bg-[#0F766E]">
              <FontAwesomeIcon icon={UsersIcon} className="text-[22px]" />
              View Our Doctors
            </button>
          </div>
        </div>
      </section>
    </main>
  );
};

export default AboutPage;