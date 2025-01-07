import React, { useEffect, useState } from 'react';

const HeavyComponent: React.FC = () => {
  const [result, setResult] = useState<number | null>(null);

  useEffect(() => {
    const worker = new Worker(new URL('./worker.ts', import.meta.url));
    worker.postMessage('data');
    worker.onmessage = (e: MessageEvent<number>) => {
      setResult(e.data);
    };
    return () => worker.terminate();
  }, []);

  return (
    <div>
      {result !== null ? (
        <p></p>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default HeavyComponent;
