import { Bell, Search, Mail, User } from 'lucide-react';

export function Header() {
  return (
    <header className="h-20 border-b border-gray-100 bg-white px-8 flex items-center justify-between">
      <div className="relative w-80">
        <Search className="absolute left-3.5 top-3 text-gray-400" size={18} />
        <input
          type="text"
          placeholder="Buscar..."
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
        />
      </div>
      <div className="flex items-center gap-3">
        <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors relative">
          <Mail size={20} />
        </button>
        <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 h-2 w-2 bg-blue-600 rounded-full"></span>
        </button>
        <div className="h-10 w-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-semibold overflow-hidden border border-blue-200 ml-2">
          <User size={22} />
        </div>
      </div>
    </header>
  );
}
