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
      entry: path.resolve(__dirname, 'src/lib.ts'),
      name: 'PrintDesigner',
      formats: ['es', 'umd'],
      fileName: (format) => `operp-print-designer.${format}.js`,
    },
    rollupOptions: {
      // 确保外部化不打包这些依赖
      external: ['react', 'react-dom', 'antd', '@ant-design/icons', 'react-to-print', 'zustand'],
      output: {
        // 在 UMD 构建中为这些外部依赖提供全局变量
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          antd: 'antd',
          '@ant-design/icons': 'icons',
          'react-to-print': 'ReactToPrint',
          zustand: 'zustand',
        },
        // 自动处理混合导出（命名导出 + 默认导出）
        exports: 'auto',
      },
    },
  },
});
