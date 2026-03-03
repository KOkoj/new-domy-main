"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Download, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PDF_URL = "/pdfs/visite%20nuovo%20sito.pdf";

export default function InspectionsFreePdfLandingPage() {
  const [language, setLanguage] = useState("cs");
  const [downloaded, setDownloaded] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred-language");
    if (savedLanguage) {
      setLanguage(savedLanguage);
      document.documentElement.lang = savedLanguage;
    }
  }, []);

  const copy = useMemo(() => {
    if (language === "it") {
      return {
        backToGuide: "Torna all'articolo",
        title: "Guida PDF gratuita: visite immobiliari in Italia",
        intro:
          "Una sintesi pratica per preparare le visite, fare le domande giuste e ridurre errori prima di fare offerte.",
        primaryCta: "Scarica PDF gratuito",
        downloadedNote: "Download avviato. Controlla anche la cartella download del telefono.",
        softTitle: "Se vuoi approfondire:",
        softDomy: "Vai al PDF premium: acquisto in Italia",
        softNotary: "Vai al PDF premium: ruolo del notaio",
        backToProcess: "Vai al processo completo",
      };
    }

    if (language === "en") {
      return {
        backToGuide: "Back to article",
        title: "Free PDF guide: property inspections in Italy",
        intro:
          "A practical summary to prepare your visits, ask the right questions, and reduce mistakes before making offers.",
        primaryCta: "Download free PDF",
        downloadedNote: "Download started. Check your phone downloads folder as well.",
        softTitle: "If you want to go deeper:",
        softDomy: "Go to premium PDF: buying in Italy",
        softNotary: "Go to premium PDF: notary role",
        backToProcess: "Go to full process",
      };
    }

    return {
      backToGuide: "Zpět na článek",
      title: "Bezplatný PDF průvodce: prohlídky nemovitostí v Itálii",
      intro:
        "Praktické shrnutí pro přípravu prohlídek, správné otázky a menší riziko chyb před podáním nabídky.",
      primaryCta: "Stáhnout bezplatné PDF",
      downloadedNote: "Stahování bylo spuštěno. Zkontrolujte i složku stažených souborů v telefonu.",
      softTitle: "Pokud chcete jít více do hloubky:",
      softDomy: "Přejít na prémiové PDF: koupě v Itálii",
      softNotary: "Přejít na prémiové PDF: role notáře",
      backToProcess: "Přejít na celý proces",
    };
  }, [language]);

  const handleDownload = () => {
    if (typeof window !== "undefined") {
      window.open(PDF_URL, "_blank", "noopener,noreferrer");
    }

    setDownloaded(true);

    fetch("/api/free-pdf/upsell", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pdfKey: "inspections-guide",
        language,
        sourcePath: "/guides/inspections/free-pdf",
      }),
      keepalive: true,
    }).catch(() => {});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f7f4ed] via-amber-50/20 to-slate-50 px-4 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto">
        <div className="mb-5 sm:mb-6">
          <Link
            href="/guides/inspections"
            className="inline-flex items-center gap-2 text-sm text-slate-700 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            {copy.backToGuide}
          </Link>
        </div>

        <Card className="border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
          <CardHeader className="pb-3">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
              <FileText className="h-3.5 w-3.5" />
              PDF
            </div>
            <CardTitle className="text-2xl sm:text-3xl font-bold text-slate-900 mt-3">
              {copy.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5 sm:space-y-6">
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">{copy.intro}</p>

            <Button
              onClick={handleDownload}
              className="w-full sm:w-auto bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-600 hover:to-slate-700 text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {copy.primaryCta}
            </Button>

            {downloaded ? (
              <p className="text-sm text-emerald-700">{copy.downloadedNote}</p>
            ) : null}

            <div className="pt-1">
              <p className="text-sm text-slate-600 mb-3">{copy.softTitle}</p>
              <div className="flex flex-col gap-2">
                <Link
                  href="/premium?product=premium-domy"
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  {copy.softDomy}
                </Link>
                <Link
                  href="/premium?product=premium-notary"
                  className="inline-flex items-center justify-center rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                >
                  {copy.softNotary}
                </Link>
              </div>
            </div>

            <div className="pt-1">
              <Link
                href="/process"
                className="text-sm text-slate-600 hover:text-slate-900 underline underline-offset-2"
              >
                {copy.backToProcess}
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
