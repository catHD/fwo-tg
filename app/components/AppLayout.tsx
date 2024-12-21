import { Tabbar } from '@telegram-apps/telegram-ui';
import { Outlet, useLocation, useNavigate } from 'react-router';

const tabs = [
  {
    path: '/character',
    text: 'Персонаж',
    icon: '👤',
  },
  {
    path: '/shop',
    text: 'Магазин',
    icon: '🛒',
  },
  {
    path: '/lobby',
    text: 'Лобби',
    icon: '',
  },
  {
    path: '/clan',
    text: 'Клан',
    icon: '🏰',
  },
  {
    path: '/settings',
    text: 'Настройки',
    icon: '⚙️',
  },
];

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <Outlet />
      <Tabbar>
        {tabs.map(({ path, icon, text }) => (
          <Tabbar.Item
            key={path}
            text={text}
            selected={location.pathname === path}
            onClick={() => navigate(path)}
          >
            {icon}
          </Tabbar.Item>
        ))}
      </Tabbar>
    </>
  );
}
