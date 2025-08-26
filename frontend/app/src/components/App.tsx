import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '@components/Header';
import { Footer } from '@components/Footer';
import { Provider } from "../components/ui/provider"
import getRoutes from '@constants/routes';
import { useStore } from '@store/index';



export default function App() {
  const bootstrapAuth = useStore((s: any) => s.bootstrapAuth);

  useEffect(() => {
    const initAuth = async () => {
      try {
        await bootstrapAuth();
      } catch (error) {
        console.error('Failed to bootstrap auth:', error);
      }
    };
    initAuth();
  }, [bootstrapAuth]);
  return (
    <Provider>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Header />
        <main style={{ flex: 1, paddingBottom: '20px'}}>
          <Routes>
            {getRoutes().map(route => {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.component/>}
                />
              )
            })}
          </Routes>
        </main>
      <Footer />
    </div>
    </Provider>
  );
}
