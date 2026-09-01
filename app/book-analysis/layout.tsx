import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Request a Foundation Evaluation | Foundation Risk",
  description:
    "Request a property-specific foundation evaluation. Share symptoms and address details so we can review the context and identify an appropriate local next step.",
  alternates: {
    canonical: "https://foundationrisk.org/book-analysis",
  },
  openGraph: {
    title: "Request a Foundation Evaluation | Foundation Risk",
    description:
      "Share your property symptoms and address details to request a foundation evaluation and identify an appropriate local next step.",
    url: "https://foundationrisk.org/book-analysis",
    images: ["/logo.png"],
  },
};

export default function BookAnalysisLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return children;
}
