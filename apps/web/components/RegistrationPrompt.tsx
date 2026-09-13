import Link from "next/link";
import { useTranslation } from "next-i18next";

export default function RegistrationPrompt({
  registrationDisabled,
}: {
  registrationDisabled?: string;
}) {
  const { t } = useTranslation();
  if (registrationDisabled === "true") return null;
  return (
    <div className="flex items-baseline gap-1 justify-center">
      <p className="w-fit text-gray-500 dark:text-gray-400">{t("new_here")}</p>
      <Link href={"/register"} className="font-semibold" data-testid="register-link">
        {t("sign_up")}
      </Link>
    </div>
  );
}
