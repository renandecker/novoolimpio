import { LayoutDashboard, BarChart2, Users, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', active: true },
    { icon: BarChart2, label: 'Relatórios' },
    { icon: Users, label: 'Clientes' },
    { icon: Settings, label: 'Configurações' },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 px-2 py-4 border-b border-slate-800">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">A</div>
          <span className="font-semibold text-lg tracking-wide">AdminPanel</span>
        </div>
        <nav className="mt-6 flex flex-col gap-1.5">
          {menuItems.map((item, index) => (
            <button
              key={index}
              className={`flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                item.active ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>
      </div>
      <button className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors">
        <LogOut size={20} />
        Sair
      </button>
    </aside>
  );
}
