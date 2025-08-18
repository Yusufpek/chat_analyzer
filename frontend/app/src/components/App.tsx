import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Header } from '@components/Header';
import { Footer } from '@components/Footer';
import { Provider } from "../components/ui/provider"
import getRoutes from '@constants/routes';


export default function App() {
  return (
    <Provider>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      <Header />
        <main style={{ flex: 1, paddingBottom: '100px' }}>
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
