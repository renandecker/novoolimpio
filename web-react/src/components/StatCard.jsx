import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ title, value, icon: Icon, trend, positive = true }) {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <h3 className="text-2xl font-bold text-gray-800 mt-1">{value}</h3>
        {trend && (
          <div className="flex items-center gap-1 mt-2 text-xs font-semibold">
            {positive ? (
              <span className="flex items-center text-emerald-600 gap-0.5">
                <TrendingUp size={14} /> {trend}
              </span>
            ) : (
              <span className="flex items-center text-rose-500 gap-0.5">
                <TrendingDown size={14} /> {trend}
              </span>
            )}
          </div>
        )}
      </div>
      <div className={`p-4 rounded-xl ${positive ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
        <Icon size={26} />
      </div>
    </div>
  );
}
