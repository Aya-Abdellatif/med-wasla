import sendEmail from "../../utils/sendEmail.js";

export function buildEmailContent(
  templateName: string,
  params: string[]
): { subject: string; html: string } {
  if (templateName === "appointment_confirmation") {
    const [specialistName, dateStr, timeStr, typeText] = params;
    return {
      subject: "تأكيد موعدك - MedWasla",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:24px">
        <h2 style="color:#2563eb">تم تأكيد موعدك ✅</h2>
        <p>مع: <strong>${specialistName}</strong></p>
        <p>التاريخ: <strong>${dateStr}</strong></p>
        <p>الوقت: <strong>${timeStr}</strong></p>
        <p>النوع: <strong>${typeText}</strong></p>
        <hr/><p style="color:#6b7280;font-size:13px">MedWasla - وصلة صحتك</p>
      </div>`,
    };
  }

  if (templateName === "appointment_reminder") {
    const [specialistName, dateStr, timeStr, typeText] = params;
    return {
      subject: "تذكير بموعدك غداً - MedWasla",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:24px">
        <h2 style="color:#d97706">تذكير بموعدك ⏰</h2>
        <p>موعدك غداً مع: <strong>${specialistName}</strong></p>
        <p>التاريخ: <strong>${dateStr}</strong></p>
        <p>الوقت: <strong>${timeStr}</strong></p>
        <p>النوع: <strong>${typeText}</strong></p>
        <hr/><p style="color:#6b7280;font-size:13px">MedWasla - وصلة صحتك</p>
      </div>`,
    };
  }

  if (templateName === "appointment_cancellation") {
    const [patientName, specialistName, dateStr, timeStr, typeText] = params;
    return {
      subject: "تم إلغاء موعدك - MedWasla",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:24px">
        <h2 style="color:#dc2626">تم إلغاء موعدك ❌</h2>
        <p>عزيزنا <strong>${patientName}</strong>،</p>
        <p>نأسف لإبلاغك بأن موعدك مع <strong>${specialistName}</strong></p>
        <p>التاريخ: <strong>${dateStr}</strong> الساعة <strong>${timeStr}</strong> (${typeText}) قد تم إلغاؤه.</p>
        <p>يمكنك حجز موعد جديد من خلال التطبيق.</p>
        <hr/><p style="color:#6b7280;font-size:13px">MedWasla - وصلة صحتك</p>
      </div>`,
    };
  }

  return { subject: "إشعار من MedWasla", html: "" };
}

export async function sendAppointmentEmail(
  to: string,
  templateName: string,
  params: string[]
): Promise<void> {
  const { subject, html } = buildEmailContent(templateName, params);
  await sendEmail({ to, subject, html });
}
