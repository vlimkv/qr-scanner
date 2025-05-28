import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';

export default function QRScanner() {
  const videoRef = useRef(null);
  const [result, setResult] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [statusColor, setStatusColor] = useState('');
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    let controls;

    const onResult = async (res, err, c) => {
      if (res) {
        const token = res.getText();
        setResult(token);
        controls = c;
        controls.stop();

        try {
          const response = await fetch('/api/check-entry', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token })
          });

          const data = await response.json();
          setStatusMessage(data.message);
          if (data.message.includes('✅')) {
            setStatusColor('text-green-500');
          } else if (data.message.includes('⚠️')) {
            setStatusColor('text-yellow-500');
          } else {
            setStatusColor('text-red-500');
          }

          // Добавляем в историю
          setEntries(prev => [
            { name: data.name || 'неизвестно', time: new Date().toLocaleTimeString() },
            ...prev.slice(0, 4)
          ]);
        } catch (e) {
          setStatusMessage('Ошибка соединения.');
          setStatusColor('text-red-500');
        }

        // Повторный запуск через 2 сек
        setTimeout(() => {
          setResult('');
          setStatusMessage('');
          setStatusColor('');
          startScanner();
        }, 2000);
      }
      if (err && !(err.name === 'NotFoundException')) {
        setStatusMessage(`Ошибка: ${err.message}`);
        setStatusColor('text-red-500');
      }
    };

    const startScanner = () => {
      codeReader.decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current,
        onResult
      ).catch(err => {
        setStatusMessage(`Ошибка камеры: ${err.message}`);
        setStatusColor('text-red-500');
      });
    };

    // 🔐 PIN-проверка
    if (!localStorage.getItem('savoa_pin')) {
      const pin = prompt('Введите пин для доступа');
      if (pin !== '9999') return;
      localStorage.setItem('savoa_pin', pin);
    }

    startScanner();

    return () => {
      if (controls) controls.stop();
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center w-full dark:text-white">
      <video
        ref={videoRef}
        className="w-[300px] h-[300px] rounded-xl object-cover border shadow-xl"
        />
      {result && (
        <p className="mt-4 text-sm text-gray-400">
          QR: <span className="font-mono">{result}</span>
        </p>
      )}
      {statusMessage && (
        <p className={`mt-3 text-xl font-medium ${statusColor} transition duration-200 text-center`}>
          {statusMessage}
        </p>
      )}

      {entries.length > 0 && (
        <div className="mt-6 w-full max-w-sm">
          <h2 className="text-sm font-semibold text-gray-500 mb-1">Последние входы</h2>
          <ul className="text-sm space-y-1">
            {entries.map((entry, i) => (
              <li key={i} className="flex justify-between text-gray-400">
                <span>{entry.name}</span>
                <span>{entry.time}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}