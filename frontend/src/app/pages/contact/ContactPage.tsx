import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCheckCircle,
  faPaperPlane,
  faPhone,
  faEnvelope,
} from "@fortawesome/free-solid-svg-icons";
import { useTranslation } from "react-i18next";
import { showSuccess } from "../../../utils/toast";

import { departmentKeys, faqKeys } from "./ContactData";
import type { ContactFormData } from "./contactTypes";

const initialFormData: ContactFormData = {
  name: "",
  email: "",
  phone: "",
  subject: "",
  message: "",
};

export default function ContactPage() {
  const { t } = useTranslation(["public", "toast", "contact"]);
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
    showSuccess(t("toast:contact.messageSent"));
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
            {t("contact:success.title")}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("contact:success.description")}
          </p>
          <p className="text-sm text-gray-500">
            {t("contact:success.responseTime")}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white text-gray-900">
      {/* Hero Section */}
      <section className="bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA] py-14 px-5 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-40 h-40 bg-teal-300 rounded-full blur-3xl rtl:right-auto rtl:left-10" />
          <div className="absolute bottom-10 left-10 w-40 h-40 bg-cyan-300 rounded-full blur-3xl rtl:left-auto rtl:right-10" />
        </div>
        <div className="max-w-4xl mx-auto relative z-10">
          <h1 className="mb-6 text-3xl font-bold md:text-4xl">
            {t("contact:hero.title")}
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-[#6B7280]">
            {t("contact:hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Form & Quick Info */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA] p-10 rounded-2xl shadow-lg">
          {/* Form */}
          <div className="lg:col-span-1">
            <h2 className="text-4xl font-bold mb-8">{t("contact:form.title")}</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">
                  {t("contact:form.fullName")}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder={t("contact:form.fullNamePlaceholder")}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition placeholder-gray-400"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                    {t("contact:form.email")}
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder={t("contact:form.emailPlaceholder")}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition placeholder-gray-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-3 text-gray-900">
                    {t("contact:form.phone")}
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t("contact:form.phonePlaceholder")}
                    className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition placeholder-gray-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">
                  {t("contact:form.subject")}
                </label>
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition"
                >
                  <option value="">{t("contact:form.subjectPlaceholder")}</option>
                  {departmentKeys.map((key) => (
                    <option key={key} value={t(`contact:departments.${key}`)}>
                      {t(`contact:departments.${key}`)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 text-gray-900">
                  {t("contact:form.message")}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  placeholder={t("contact:form.messagePlaceholder")}
                  className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-teal-500 focus:shadow-lg transition resize-none placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                className="group flex items-center w-full gap-2 bg-primary text-white border-2 border-primary font-bold text-base px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 ease-in-out hover:border-primary hover:-translate-y-0.5 hover:bg-transparent hover:text-primary hover:shadow-md whitespace-nowrap"
              >
                <FontAwesomeIcon icon={faPaperPlane} />
                <span>{t("contact:form.submit")}</span>
              </button>
            </form>
          </div>

          {/* Right Column - 2 cards stacked */}
          <div className="flex flex-col gap-6 mt-24">
            {/* Email */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                  <FontAwesomeIcon icon={faEnvelope} className="text-primary text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 mb-2 text-lg">
                    {t("contact:info.email.title")}
                  </h3>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600">
                      {t("contact:info.email.primary")}
                    </p>
                    <p className="text-sm text-gray-600">
                      {t("contact:info.email.secondary")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency */}
            <div className="group whitespace-nowrap rounded-2xl border border-transparent bg-primary p-8 text-white shadow-lg transition-all duration-300 ease-in-out">
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 transition-colors duration-300">
                  <FontAwesomeIcon
                    icon={faPhone}
                    className="text-xl text-white transition-colors duration-300"
                  />
                </div>

                <div>
                  <h3 className="mb-2 text-lg font-bold">
                    {t("contact:info.support.title")}
                  </h3>

                  <a
                    href="tel:+12345678891"
                    className="flex items-center gap-2 text-lg font-bold hover:underline"
                  >
                    {t("contact:info.support.number")}
                  </a>

                  <p className="mt-2 text-xs text-white/80 transition-colors duration-300">
                    {t("contact:info.support.availability")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQs */}
      <section className="py-20 px-4 bg-linear-to-br from-[#F6FFFB] via-[#ECFEFF] to-[#F0FDFA]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t("contact:faqSection.title")}</h2>
            <p className="text-lg text-gray-600">{t("contact:faqSection.subtitle")}</p>
          </div>

          <div className="space-y-4">
            {faqKeys.map((key, index) => (
              <div
                key={key}
                className="bg-white rounded-xl overflow-hidden hover:shadow-md transition"
              >
                <button
                  onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                  className="w-full p-6 text-left rtl:text-right flex items-center justify-between font-semibold hover:bg-gray-100 transition"
                >
                  <span className="text-lg text-gray-900">
                    {t(`contact:faqs.${key}.question`)}
                  </span>
                  <span
                    className={`text-teal-500 transition-transform ${expandedFAQ === index ? "rotate-180" : ""
                      }`}
                  >
                    ▼
                  </span>
                </button>
                {expandedFAQ === index && (
                  <div className="px-6 pt-6 pb-6 border-t border-gray-200">
                    <p className="text-gray-600 leading-relaxed">
                      {t(`contact:faqs.${key}.answer`)}
                    </p>
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