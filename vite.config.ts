import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  define: {
    'process.env': {},
  },
  // 库模式配置
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'PrintDesigner',
      formats: ['es', 'umd'],
      fileName: (format) => `print-designer.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化不打包这些依赖
      external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'react-grid-layout', 'react-resizable', 'react-to-print', 'zustand'],
      output: {
        // 在 UMD 构建中为这些外部依赖提供全局变量
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          '@ant-design/icons': 'icons',
          'react-grid-layout': 'GridLayout',
          'react-resizable': 'ReactResizable',
          'react-to-print': 'ReactToPrint',
          zustand: 'zustand',
        },
      },
    },
  },
});
