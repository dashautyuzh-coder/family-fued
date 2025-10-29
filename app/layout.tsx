import type { Metadata } from "next";
import { ag1DarkTheme } from "@/styles/theme.css";
import { Inter, Poppins } from "next/font/google";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-poppins",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AG1 Family Feud",
  description: "Run your offsite showdown",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${ag1DarkTheme} ${inter.variable} ${poppins.variable}`}>
        {children}
      </body>
    </html>
  );
}
