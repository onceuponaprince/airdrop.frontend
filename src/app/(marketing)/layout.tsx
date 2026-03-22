import type { Metadata } from "next"
import Script from "next/script"
import { Navigation } from "@/components/shared/Navigation"
import { Footer } from "@/components/shared/Footer"

const GA_ID = "G-DWTQJ0H0S1"

export const metadata: Metadata = {
  title: "AI(r)Drop — AI-Powered Airdrop Scoring for Real Contributors",
}



export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode,
}) {
  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">{`
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag("js", new Date());
        gtag("config", "${GA_ID}");
      `}</Script>
      <Navigation />
      <main className="flex-1 pt-16">{children}</main>
      <Footer />
    </>
  )
}