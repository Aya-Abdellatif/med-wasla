import { useState } from "react";
// import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPaperPlane,
  faLocationDot,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";

import { contactInfo, departments, faqs } from "./ContactData";
import type { ContactFormData } from "./contactTypes";

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  // const navigate = useNavigate();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    console.log("Contact form submitted:", formData);

    setIsSubmitted(true);

    setTimeout(() => {
      setIsSubmitted(false);
      setFormData(initialFormData);
    }, 3000);
  };

  if (isSubmitted) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-teal-50 to-cyan-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FontAwesomeIcon
              icon={faCheckCircle}
              className="text-teal-500 text-4xl"
            />
          </div>

          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Message Sent!
          </h2>

          <p className="text-gray-500">
            Thank you for contacting us. We'll get back to you soon.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero */}
      <section className="bg-linear-to-br from-teal-50 to-cyan-50 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Get in Touch
        </h1>

        <p className="max-w-3xl mx-auto text-lg md:text-xl text-gray-500 leading-relaxed">
          Have questions or need assistance? We're here to help. Reach out to
          our team and we'll respond as soon as possible.
        </p>
      </section>

      {/* Contact Info */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {contactInfo.map((item) => (
            <div
              key={item.title}
              className="bg-gray-50 rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center mb-5 ${item.iconBoxClass}`}
              >
                <FontAwesomeIcon icon={item.icon} className="text-xl" />
              </div>

              <h3 className="text-lg font-bold mb-4">{item.title}</h3>

              <div className="space-y-1">
                {item.details.map((detail) => (
                  <p key={detail} className="text-gray-500">
                    {detail}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Form + Facility */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12">
          {/* Form */}
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Send Us a Message
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block font-medium mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john.doe@example.com"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (234) 567-890"
                    className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium mb-2">Subject *</label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="">Select a subject</option>
                  {departments.map((department) => (
                    <option key={department} value={department}>
                      {department}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-2">Message *</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={6}
                  placeholder="How can we help you?"
                  className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#14B8A6] text-white py-4 rounded-lg font-semibold text-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-3"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Facility */}
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Visit Our Facility
              </h2>

              <div className="bg-white rounded-xl shadow-lg p-10 text-center">
                <FontAwesomeIcon
                  icon={faLocationDot}
                  className="text-[#14B8A6] text-5xl mb-6"
                />

                <h3 className="text-xl font-bold mb-4">
                  HealthCarePlus Medical Center
                </h3>

                <p className="text-gray-500 leading-relaxed mb-5">
                  123 Healthcare Ave
                  <br />
                  Medical District
                  <br />
                  New York, NY 10001
                </p>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  className="text-[#14B8A6] font-semibold hover:text-teal-600"
                >
                  Get Directions
                </a>
              </div>
            </div>

            <div className="bg-[#14B8A6] text-white rounded-xl p-8">
              <h3 className="text-2xl font-bold mb-4">Emergency Contact</h3>

              <p className="text-white/90 mb-6 leading-relaxed">
                For medical emergencies, please call our emergency line or visit
                our emergency department immediately.
              </p>

              <a
                href="tel:+1234567891"
                className="inline-flex items-center gap-3 bg-white text-[#14B8A6] px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
              >
                <FontAwesomeIcon icon={faPhone} />
                <span>+1 (234) 567-891</span>
              </a>

              <p className="text-sm text-white/80 mt-4">Available 24/7</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>

            <p className="text-lg text-gray-500">
              Quick answers to common questions about our services.
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq) => (
              <div key={faq.question} className="bg-gray-50 rounded-xl p-6">
                <h3 className="text-lg font-bold mb-3">{faq.question}</h3>
                <p className="text-gray-500 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}