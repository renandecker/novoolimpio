import { recentesData } from '../data/mockData';

export function RecentSalesTable() {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Clientes Recentes</h3>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              <th className="pb-3">Clientes</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Compra</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-sm">
            {recentesData.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                <td className="py-3.5 font-medium text-gray-800">{item.cliente}</td>
                <td className="py-3.5 text-gray-500">{item.email}</td>
                <td className="py-3.5 font-medium text-gray-800">{item.compra}</td>
                <td className="py-3.5">
                  <span
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                      item.status === 'Pago'
                        ? 'bg-emerald-50 text-emerald-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
