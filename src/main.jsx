import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

import '@fontsource/cormorant-garamond/300.css';
import '@fontsource/cormorant-garamond/400.css';
import '@fontsource/cormorant-garamond/400-italic.css';
import '@fontsource/cormorant-garamond/500.css';
import '@fontsource/cormorant-garamond/600.css';
import '@fontsource/jost/300.css';
import '@fontsource/jost/400.css';
import '@fontsource/jost/500.css';
import './styles/global.css';
import './styles/collection.css';
import './styles/sections.css';
import './styles/overlays.css';
import './styles/responsive.css';
import './styles/animations.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
