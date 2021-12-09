import isMobile from 'ismobilejs';
import { Routes, Route } from 'react-router';

import { Home, EmptyMobile, NoMatch } from '@/views';

import { AppSnackbar, Layout } from './components';

export const App = () => {
  const isAnyMobileDevice = isMobile(window.navigator).any;

  return (
    <>
      {isAnyMobileDevice ? (
        <EmptyMobile />
      ) : (
        <Routes>
          <Route
            index
            element={
              <Layout>
                <Home />
              </Layout>
            }
          />
          <Route path="*" element={<NoMatch />} />
        </Routes>
      )}
      <AppSnackbar />
    </>
  );
};
