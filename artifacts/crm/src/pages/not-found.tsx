import { useTranslation } from "react-i18next";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const { t } = useTranslation();
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="text-9xl font-black text-primary/10 mb-4 select-none">404</div>
        <h1 className="text-2xl font-bold text-foreground mb-2">{t("errors.notFound")}</h1>
        <p className="text-muted-foreground mb-8 text-sm">{t("errors.unauthorized")}</p>
        <Link href="/">
          <a className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t("common.backToList")}
          </a>
        </Link>
      </div>
    </div>
  );
}
