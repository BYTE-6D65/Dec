import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

// Lazy load Excalidraw component
const ExcalidrawWrapper = lazy(() => import('./components/ExcalidrawWrapper').then(m => ({ default: m.ExcalidrawWrapper })));

function App() {
  return (
    <BrowserRouter>
      <div style={{ width: '100vw', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>Loading...</div>}>
          <Routes>
            <Route path="/excalidraw" element={<ExcalidrawWrapper />} />
            <Route path="/" element={<Navigate to="/excalidraw" replace />} />
          </Routes>
        </Suspense>
      </div>
    </BrowserRouter>
  );
}

export default App;
