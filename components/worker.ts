// Define the function outside the block
function computeChunk(i: number, sum: number, CHUNK_SIZE: number): void {
  const end = Math.min(i + CHUNK_SIZE, 1e7);
  for (; i < end; i++) {
    sum += i;
  }
  if (i < 1e7) {
    setTimeout(() => computeChunk(i, sum, CHUNK_SIZE), 0); // Schedule next chunk
  } else {
    self.postMessage(sum);
  }
}

self.onmessage = (e: MessageEvent<string>) => {
  if (typeof e.data === 'string' && e.data === 'data') {
    // Perform heavy computation here in chunks
    const CHUNK_SIZE = 1e6; // Adjust chunk size based on your needs
    let sum = 0;
    let i = 0;

    computeChunk(i, sum, CHUNK_SIZE);
  }
};
