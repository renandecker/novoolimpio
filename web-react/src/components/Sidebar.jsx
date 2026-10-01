import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  BarChart2,
  Users,
  Settings,
  LogOut,
  Package,
  ShoppingBag,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['estoque']);

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/',
      active: location.pathname === '/',
    },
    {
      icon: Package,
      label: 'Estoque',
      children: [
        {
          icon: ShoppingBag,
          label: 'Vendas',
          children: [
            { label: 'Venda Produtos', path: '/view/estoque/vendaproduto' },
          ],
        },
        { label: 'Produtos Estoque', path: '/view/estoque/estoqueproduto', icon: Package },
        { label: 'Controle Estoque', path: '/view/estoque/controleestoque', icon: Package },
      ],
    },
    { icon: BarChart2, label: 'Relatórios', path: '/relatorios' },
    { icon: Users, label: 'Clientes', path: '/clientes' },
    { icon: Settings, label: 'Configurações', path: '/configuracoes' },
  ];

  const toggleMenu = (menuKey: string) => {
    setExpandedMenus((prev) =>
      prev.includes(menuKey) ? prev.filter((m) => m !== menuKey) : [...prev, menuKey]
    );
  };

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const renderMenuItem = (item: any, depth = 0) => {
    const isExpanded = expandedMenus.includes(item.label.toLowerCase().replace(/\s+/g, '-'));
    const hasChildren = item.children && item.children.length > 0;
    const active = item.path ? isActive(item.path) : item.children?.some((c: any) => c.path && isActive(c.path));

    if (hasChildren) {
      return (
        <div key={item.label} className={`pl-${depth * 4}`}>
          <button
            onClick={() => toggleMenu(item.label.toLowerCase().replace(/\s+/g, '-'))}
            className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors w-full text-left ${
              active ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
            style={{ minWidth: '100%' }}
          >
            {item.icon && <item.icon size={18} className="flex-shrink-0" />}
            <span className="flex-1 truncate">{item.label}</span>
            <ChevronDown size={16} className={`flex-shrink-0 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          </button>
          {isExpanded && (
            <div className="mt-1 space-y-1 border-l-2 border-slate-800 pl-2">
              {item.children.map((child: any, idx: number) => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      );
    }

    return (
      <NavLink
        key={item.label}
        to={item.path}
        className={({ isActive: navActive }) =>
          `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            navActive ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
          }`
        }
      >
        {item.icon && <item.icon size={18} className="flex-shrink-0" />}
        <span className="truncate">{item.label}</span>
      </NavLink>
    );
  };

  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2.5 px-2 py-4 border-b border-slate-800">
          <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md">A</div>
          <span className="font-semibold text-lg tracking-wide">AdminPanel</span>
        </div>
        <nav className="mt-6 flex flex-col gap-1.5">
          {menuItems.map((item) => renderMenuItem(item))}
        </nav>
      </div>
      <button className="flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-red-400 transition-colors">
        <LogOut size={20} />
        Sair
      </button>
    </aside>
  );
}