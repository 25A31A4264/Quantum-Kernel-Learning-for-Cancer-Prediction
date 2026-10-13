import type { Metadata } from "next";
import { Space_Grotesk, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  variable: "--font-ibm-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "QUANTUMON — Quantum Kernel Intelligence for Cancer Research",
  description: "A scientific research platform evaluating quantum-kernel machine learning (Qiskit ZZFeatureMap, QSVC) for cancer-related mutation and metastasis prediction with fair classical baselines (RBF SVM, XGBoost).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${ibmPlexMono.variable} dark`}
    >
      <body className="min-h-screen bg-[#0B0D0F] text-[#F2F3EE] antialiased selection:bg-[#62E6E0]/20 selection:text-[#62E6E0]">
        {children}
      </body>
    </html>
  );
}
