import "./globals.css";

export const metadata = {
  title: "RCB Fan Hub",
  description: "Royal Challengers Bengaluru squad manager and fan wall",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
