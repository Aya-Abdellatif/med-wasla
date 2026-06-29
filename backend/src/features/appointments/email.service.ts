import sendEmail from "../../utils/sendEmail.js";

export function buildEmailContent(
  templateName: string,
  params: string[]
): { subject: string; html: string } {
  if (templateName === "appointment_confirm") {
    const [patientName, specialistName, dateStr, timeStr] = params;
    return {
      subject: "تأكيد موعدك - ميد واصلة",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:24px;color:#111827">
        <p>مرحبًا <strong>${patientName}</strong>،</p>
        <p>تم تأكيد موعدك مع <strong>${specialistName}</strong>.</p>
        <p>📅 التاريخ: <strong>${dateStr}</strong></p>
        <p>🕒 الوقت: <strong>${timeStr}</strong></p>
        <br/>
        <p>نتطلع لاستقبالكم في الموعد المحدد.</p>
        <p>فريق ميد واصلة</p>
      </div>`,
    };
  }

  if (templateName === "appointment_reminder") {
    const [patientName, specialistName, dateStr, timeStr] = params;
    return {
      subject: "تذكير بموعدك - ميد واصلة",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:24px;color:#111827">
        <p>مرحبًا <strong>${patientName}</strong>،</p>
        <p>نود تذكيرك بموعدك مع <strong>${specialistName}</strong>.</p>
        <p>📅 التاريخ: <strong>${dateStr}</strong></p>
        <p>🕒 الوقت: <strong>${timeStr}</strong></p>
        <br/>
        <p>نتمنى لك دوام الصحة.</p>
        <p>فريق ميد واصلة</p>
      </div>`,
    };
  }

  if (templateName === "appointment_cancel") {
    const [patientName, specialistName, dateStr, timeStr] = params;
    return {
      subject: "إشعار بإلغاء الموعد - ميد واصلة",
      html: `<div dir="rtl" style="font-family:Arial,sans-serif;padding:24px;color:#111827">
        <p>مرحبًا <strong>${patientName}</strong>،</p>
        <p>نأسف لإبلاغك بأنه تم إلغاء موعدك مع <strong>${specialistName}</strong>، والذي كان مقررًا يوم <strong>${dateStr}</strong> في تمام <strong>${timeStr}</strong>.</p>
        <br/>
        <p>يمكنك حجز موعد جديد من خلال التطبيق.</p>
        <p>فريق ميد واصلة</p>
      </div>`,
    };
  }

  return { subject: "إشعار من ميد واصلة", html: "" };
}

export async function sendAppointmentEmail(
  to: string,
  templateName: string,
  params: string[]
): Promise<void> {
  const { subject, html } = buildEmailContent(templateName, params);
  await sendEmail({ to, subject, html });
}
