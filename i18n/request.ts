import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies(); // ✅ MUST await in Next 16
  const locale = cookieStore.get("aria-locale")?.value ?? "en";

  let messages;

  try {
    messages = (await import(`../messages/${locale}.json`)).default;
  } catch {
    messages = (await import(`../messages/en.json`)).default;
  }

  return {
    locale,
    messages,
    timeZone: "Asia/Kolkata",
  };
});