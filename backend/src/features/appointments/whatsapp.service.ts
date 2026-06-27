import axios from "axios";

function toInternationalPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `2${digits}` : digits;
}

export async function sendWhatsAppMessage(
  phone: string,
  templateName: string,
  templateParams: string[]
): Promise<string | null> {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

  if (!token || !phoneNumberId) {
    console.log(`[WhatsApp DEV] To: ${phone}, template: ${templateName}, params:`, templateParams);
    return "dev-mock-id";
  }

  const to = toInternationalPhone(phone);
  console.log(`[WhatsApp] Sending template "${templateName}" to ${to}`);

  try {
    const { data } = await axios.post<{ messages?: { id: string }[] }>(
      `https://graph.facebook.com/v25.0/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: "ar" },
          components: [
            {
              type: "body",
              parameters: templateParams.map(p => ({ type: "text", text: p })),
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`[WhatsApp] Sent successfully, message id: ${data.messages?.[0]?.id}`);
    return data.messages?.[0]?.id ?? null;

  } catch (err) {
    if (axios.isAxiosError(err)) {
      const code = err.response?.data?.error?.code;
      const message = err.response?.data?.error?.message;
      console.error(`[WhatsApp] Error ${err.response?.status}:`, err.response?.data);
      if (code === 131026) throw new Error("NOT_ON_WHATSAPP", { cause: err });
      throw new Error(message ?? "WHATSAPP_SEND_FAILED", { cause: err });
    }
    throw err;
  }
}
