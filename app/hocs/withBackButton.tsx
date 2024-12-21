import { backButton } from '@telegram-apps/sdk-react';
import type { ComponentType } from 'react';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router';

export function withBackButton(Component: ComponentType) {
  return () => {
    const navigate = useNavigate();

    const back = useCallback(() => navigate(-1), [navigate]);

    useEffect(() => {
      backButton.show();
      backButton.onClick(back);

      return () => {
        backButton.hide();
        backButton.offClick(back);
      };
    }, [back]);

    return <Component />;
  };
}
