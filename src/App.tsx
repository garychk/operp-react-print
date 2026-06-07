import React from 'react';
import PrintDesigner from './components/PrintDesigner';

const App: React.FC = () => {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <PrintDesigner />
    </div>
  );
};

export default App;
