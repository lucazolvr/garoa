import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // Caminhos relativos: o build funciona em qualquer hospedagem estática, até numa subpasta.
  base: './',
  plugins: [react()],
  test: {
    environment: 'node',
  },
});
