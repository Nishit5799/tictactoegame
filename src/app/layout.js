import "./globals.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export const metadata = {
  title: "TIC TAC TOE",
  description: "Fun offline game to play with friends",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={` antialiased`}>
        <ToastContainer />
        {children}
      </body>
    </html>
  );
}
