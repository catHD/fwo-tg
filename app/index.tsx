import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { EnvUnsupported } from './components/EnvUnsupported';
import { Root } from './components/Root';
import { init } from './init';

import '@telegram-apps/telegram-ui/dist/styles.css';
import './index.css';

import './mockEnv';

const root = createRoot(document.getElementById('root')!);

try {
  init(retrieveLaunchParams().startParam === 'debug' || import.meta.env.DEV);

  root.render(
    <StrictMode>
      <Root />
    </StrictMode>,
  );
} catch {
  root.render(<EnvUnsupported />);
}
