import "./globals.css";

export const metadata = {
  title: "What The Internet Knows About You",
  description: "A small privacy-awareness demo showing what websites can see about you.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}