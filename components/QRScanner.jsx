import { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

export default function QRScanner() {
  const [scanResult, setScanResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const audioRef = useRef(null);

  useEffect(() => {
    const scanner = new Html5QrcodeScanner('reader', {
      fps: 10,
      qrbox: { width: 260, height: 260 },
      aspectRatio: 1,
    });

    const onScanSuccess = async (decodedText) => {
      setScanResult(decodedText);
      scanner.clear();
      try {
        const res = await fetch('/api/check-entry', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: decodedText }),
        });
        const data = await res.json();
        setStatusMessage(data.message);

        if (data.message.includes('✅')) {
          setStatusColor('text-green-500');
          audioRef.current?.play();
        } else if (data.message.includes('⚠️')) {
          setStatusColor('text-yellow-500');
        } else {
          setStatusColor('text-red-500');
        }
      } catch (err) {
        setStatusMessage('Ошибка соединения с сервером.');
        setStatusColor('text-red-500');
      }
    };

    scanner.render(onScanSuccess);
    return () => scanner.clear();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <audio ref={audioRef} src="/ding.mp3" preload="auto" />
      <div
        id="reader"
        className="w-[280px] h-[280px] rounded-xl border border-gray-300 bg-white shadow-xl transition-all"
      />
      {scanResult && (
        <p className="mt-4 text-sm text-gray-400">
          QR: <span className="font-mono">{scanResult}</span>
        </p>
      )}
      {statusMessage && (
        <p className={`mt-3 text-xl font-medium ${statusColor} transition duration-200 text-center`}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}
