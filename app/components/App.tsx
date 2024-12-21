import { miniApp, useSignal, useLaunchParams } from '@telegram-apps/sdk-react';
import { AppRoot, Placeholder } from '@telegram-apps/telegram-ui';
import { Suspense } from 'react';
import { HashRouter } from 'react-router';

import { getCharacter } from '@/client/character';
import { CharacterProvider } from '@/contexts/character';
import { Router } from '@/router';

export function App() {
  const lp = useLaunchParams();
  const isDark = useSignal(miniApp.isDark);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.platform) ? 'ios' : 'base'}
    >
      <HashRouter>
        <Suspense fallback={<Placeholder description="Ищем вашего персонажа..." />}>
          <CharacterProvider characterPromise={getCharacter()}>
            <Router />
          </CharacterProvider>
        </Suspense>
      </HashRouter>
    </AppRoot>
  );
}
