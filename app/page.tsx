import TopBanner from "@/app/components/common/TopBanner";
import Navbar from "./components/common/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <TopBanner />
      <Navbar />
    </main>
  );
}