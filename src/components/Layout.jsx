import { NavLink, Outlet } from 'react-router-dom';

const NAV = [
  { to: '/',               icon: '⚡', label: 'Builder'       },
  { to: '/email-builder',  icon: '📧', label: 'Email Builder' },
  { to: '/glossary',       icon: '📖', label: 'Glossary'      },
  { to: '/history',        icon: '🕓', label: 'History'       },
];

export default function Layout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside
        className="flex-none flex flex-col"
        style={{ width: 240, background: '#0d0d0d', borderRight: '1px solid #1a1a1a' }}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b" style={{ borderColor: '#1a1a1a' }}>
          <img
            src="https://kajabi-storefronts-production.kajabi-cdn.com/kajabi-storefronts-production/file-uploads/themes/2164751305/settings_images/a873d5-a7a4-e2ba-0222-2a6224428c21_2946885f-ffea-485a-9de3-55c9ebec76f1.png"
            alt="Ermes Dance Academy"
            className="h-10 w-auto opacity-85"
            style={{ filter: 'grayscale(100%) contrast(1.1) brightness(1.8)' }}
          />
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <span className="text-base">{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t" style={{ borderColor: '#1a1a1a' }}>
          <p className="text-xs font-medium text-gray-600">LP Builder v1.0</p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto" style={{ background: '#080808' }}>
        <Outlet />
      </main>
    </div>
  );
}
