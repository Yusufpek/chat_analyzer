import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '@components/Header';
import { Footer } from '@components/Footer';
import { Provider } from "../components/ui/provider"
import getRoutes from '@constants/routes';
import { useStore } from '@store/index';
import { Spinner } from '@chakra-ui/react';



export default function App() {
  const bootstrapAuth = useStore((s: any) => s.bootstrapAuth);
  const authInitialized = useStore((s: any) => s.authInitialized);
  const authStatus = useStore((s: any) => s.authStatus);
  const location = useLocation();

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

  
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  // Prevent body scroll when on analyze page
  useEffect(() => {
    if (location.pathname.startsWith('/analyze')) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [location.pathname]);
  
  return (
    <Provider>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh'
    }}>
      {!authInitialized || authStatus === 'loading' ? (
        <div style={{
          display: 'flex',
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          padding: '32px'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            <Spinner size='lg' color='blue.500' />
            <div style={{ color: '#64748b', fontSize: 14 }}>Loading app…</div>
          </div>
        </div>
      ) : (
        <>
          <Header />
            <main style={{ flex: 1, paddingTop: '88px'}}>
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
          {location.pathname.startsWith('/analyze') ? null : <Footer />}
        </>
      )}
    </div>
    </Provider>
  );
}
