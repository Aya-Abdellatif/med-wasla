import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPaperPlane,
  // faLocationDot,
  faPhone,
  faEnvelope,
  faClock,
  faArrowRight,
} from "@fortawesome/free-solid-svg-icons";

import {  departments, faqs } from "./ContactData";
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
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

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
          <p className="text-gray-600 mb-6">
            Thank you for contacting us. We'll get back to you as soon as possible.
          </p>
          <p className="text-sm text-gray-500">Expected response time: 24-48 hours</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-teal-50 via-cyan-50 to-blue-50 py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-teal-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-300 rounded-full blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Get in Touch
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Have questions or need assistance? Our team is here to help. Reach out and we'll respond within 24-48 hours.
          </p>
        </div>
      </section>

      {/* Contact Info Cards
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {contactInfo.map((item) => (
              <div
                key={item.title}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer group"
              >
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform ${item.iconBoxClass}`}
                >
                  <FontAwesomeIcon icon={item.icon} className="text-2xl" />
                </div>
                <h3 className="text-lg font-bold mb-4">{item.title}</h3>
                <div className="space-y-2">
                  {item.details.map((detail) => (
                    <p key={detail} className="text-gray-600 text-sm leading-relaxed">
                      {detail}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section> */}

      {/* Form & Quick Info */}
      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-4 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2">
            <h2 className="text-4xl font-bold mb-8">Send us a Message</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Doe"
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition placeholder-gray-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="john@example.com"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (234) 567-890"
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">
                  Subject *
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition"
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
                <label className="block text-sm font-semibold mb-3 text-gray-900">
                  Message *
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder="Tell us how we can help..."
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition resize-none placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-linear-to-r from-teal-500 to-cyan-500 text-white py-4 rounded-xl font-semibold text-lg hover:from-teal-600 hover:to-cyan-600 transition-all flex items-center justify-center gap-3 shadow-lg hover:shadow-xl"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>Send Message</span>
              </button>
            </form>
          </div>

          {/* Quick Contact Info - Center Column */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faClock} className="text-purple-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-3">Working Hours</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <p><span className="font-semibold">Mon-Fri:</span> 8AM - 8PM</p>
                    <p><span className="font-semibold">Sat-Sun:</span> 9AM - 5PM</p>
                    <p><span className="font-semibold">Emergency:</span> 24/7</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faEnvelope} className="text-green-500 text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2">Email</h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">info@healthcareplus.com</p>
                    <p className="text-sm text-gray-600">support@healthcareplus.com</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Column */}
          <div>
            <div className="bg-linear-to-br from-teal-500 to-cyan-500 text-white rounded-2xl p-8 shadow-lg sticky top-20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faPhone} className="text-white text-xl" />
                </div>
                <div>
                  <h3 className="font-bold mb-2">Emergency</h3>
                  <a
                    href="tel:+12345678891"
                    className="text-lg font-bold hover:underline flex items-center gap-2"
                  >
                    +1 (234) 567-891
                    <FontAwesomeIcon icon={faArrowRight} className="text-sm" />
                  </a>
                  <p className="text-xs text-white/80 mt-2">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-gray-600">Quick answers to common questions</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between font-semibold hover:bg-gray-100 transition"
                >
                  <span className="text-lg text-gray-900">{faq.question}</span>
                  <span
                    className={`text-teal-500 transition-transform ${
                      expandedFAQ === index ? "rotate-180" : ""
                    }`}
                  >
                    ▼
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pb-6 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}