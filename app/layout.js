import "./globals.css";

export const metadata = {
  title: "Personal Expense Tracker",
  description: "Track and categorize your personal expenses",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
