import QRScanner from '../components/QRScanner';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefefe] to-[#f2f2f2] text-neutral-800 flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-8 animate-fade-in">
        <h1 className="text-4xl font-semibold tracking-tight mb-2 text-neutral-900">
          SAVOA Club
        </h1>
        <p className="text-md text-gray-500">Сканирование именного билета</p>
      </div>

      <QRScanner />

      <footer className="mt-12 text-xs text-gray-400 tracking-wide animate-fade-in delay-500">
        SAVOA Club © {new Date().getFullYear()}
      </footer>
    </div>
  );
}
