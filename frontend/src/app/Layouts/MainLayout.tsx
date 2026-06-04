import { Outlet } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Footer from "../components/common/Footer";
// import ChatbotButton from "../components/ChatbotButton";

export default function MainLayout() {
  return (
    <>
      <Navbar />

      <main>
        <Outlet />
      </main>

      {/* <ChatbotButton /> */}
      <Footer />
    </>
  );
}
