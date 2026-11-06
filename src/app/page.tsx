import Footer from "@/components/layout/Footer";
import Header from "@/components/layout/Header";
import QRGenerator from "@/components/generator/QRGenerator";

export default function Home() {
  return (
    <>
      <Header />
      <main>
        <h1 className="sr-only">QR Code MaR — generator kode QR</h1>
        <QRGenerator />
      </main>
      <Footer />
    </>
  );
}
