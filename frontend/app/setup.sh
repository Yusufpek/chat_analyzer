#!/bin/zsh

# Conda environment aktif et ve proje dizinine geç
conda activate chat-analyzer
cd "/Users/ahmetserefeker/Desktop/chat analyzer" || exit

# npm projesi başlat ve gerekli paketleri yükle
npm init -y
npm install react@18 react-dom@18 react-router-dom@6 zustand sass
npm install -D typescript @types/react @types/react-dom webpack webpack-cli webpack-dev-server ts-loader css-loader sass-loader style-loader html-webpack-plugin

# Klasörleri oluştur
mkdir -p src/components src/containers/Home src/modules src/store src/constants src/api src/utils src/styles public

# tsconfig.json oluştur
cat << 'EOF' > tsconfig.json
{
  "compilerOptions": {
    "target": "ES2019",
    "lib": ["DOM", "ES2019"],
    "jsx": "react-jsx",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "baseUrl": "src",
    "paths": {
      "@components/*": ["components/*"],
      "@containers/*": ["containers/*"],
      "@modules/*": ["modules/*"],
      "@store/*": ["store/*"],
      "@constants/*": ["constants/*"],
      "@utils/*": ["utils/*"]
    },
    "allowJs": true
  },
  "include": ["src"]
}
EOF

# webpack.config.js oluştur
cat << 'EOF' > webpack.config.js
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: path.resolve(__dirname, 'src/index.tsx'),
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.[contenthash].js',
    clean: true,
    publicPath: '/'
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@containers': path.resolve(__dirname, 'src/containers'),
      '@modules': path.resolve(__dirname, 'src/modules'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@constants': path.resolve(__dirname, 'src/constants'),
      '@utils': path.resolve(__dirname, 'src/utils')
    }
  },
  devtool: 'source-map',
  devServer: {
    static: { directory: path.resolve(__dirname, 'public') },
    historyApiFallback: true,
    port: 5173,
    open: true,
    hot: true
  },
  module: {
    rules: [
      { test: /\.tsx?$/, use: 'ts-loader', exclude: /node_modules/ },
      { test: /\.s?css$/, use: ['style-loader', 'css-loader', 'sass-loader'] }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({ template: path.resolve(__dirname, 'public/index.html') })
  ]
};
EOF

# public/index.html oluştur
cat << 'EOF' > public/index.html
<!doctype html>
<html lang="tr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Chat Analyzer</title>
</head>
<body>
  <div id="root"></div>
</body>
</html>
EOF

# src/index.tsx oluştur
cat << 'EOF' > src/index.tsx
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './styles/global.scss';

const container = document.getElementById('root');
if (!container) throw new Error('Root container not found');
const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
EOF

# src/App.tsx oluştur
cat << 'EOF' > src/App.tsx
import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Home from '@containers/Home/Home';

export default function App() {
  return (
    <div>
      <nav>
        <Link to='/' style={{ marginRight: 12 }}>Home</Link>
      </nav>
      <Routes>
        <Route path='/' element={<Home />} />
      </Routes>
    </div>
  );
}
EOF

# src/containers/Home/Home.tsx oluştur
cat << 'EOF' > src/containers/Home/Home.tsx
import React from 'react';
import { useUserStore } from '@store/userStore';

export default function Home() {
  const username = useUserStore(s => s.username);
  const setUsername = useUserStore(s => s.setUsername);
  return (
    <section>
      <h1>Home</h1>
      <p>Merhaba, {username || 'Ziyaretçi'}!</p>
      <input
        placeholder='Kullanıcı adı'
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
    </section>
  );
}
EOF

# src/store/userStore.ts oluştur
cat << 'EOF' > src/store/userStore.ts
import { create } from 'zustand';

type UserState = {
  username: string;
  setUsername: (name: string) => void;
};

export const useUserStore = create<UserState>((set) => ({
  username: '',
  setUsername: (name) => set({ username: name }),
}));
EOF

# src/constants/index.ts oluştur
cat << 'EOF' > src/constants/index.ts
export const API_BASE_URL = '/api';
EOF

# src/utils/index.ts oluştur
cat << 'EOF' > src/utils/index.ts
export const formatDate = (date: Date) => new Intl.DateTimeFormat('tr-TR').format(date);
EOF

# src/api/requestLayer.js oluştur
cat << 'EOF' > src/api/requestLayer.js
export async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'Request failed');
  }
  const contentType = response.headers.get('content-type') || '';
  return contentType.includes('application/json') ? response.json() : response.text();
}
EOF

# src/styles/global.scss oluştur
cat << 'EOF' > src/styles/global.scss
* { box-sizing: border-box; }
html, body, #root { height: 100%; margin: 0; }
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', sans-serif; }
nav { padding: 12px; border-bottom: 1px solid #eee; }
section { padding: 16px; }
input { padding: 8px 10px; }
EOF

# package.json scriptlerini güncelle
node -e "const fs=require('fs');const pkg=JSON.parse(fs.readFileSync('package.json','utf8'));pkg.scripts={dev:'webpack serve --mode development --port 5173',build:'webpack --mode production',typecheck:'tsc --noEmit'};fs.writeFileSync('package.json',JSON.stringify(pkg,null,2));console.log('package.json scripts updated');"

echo "Setup tamamlandı! 'npm run dev' ile projeyi başlatabilirsin."
