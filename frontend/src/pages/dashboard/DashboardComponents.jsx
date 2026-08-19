import React from 'react';
import { 
  ArrowUpIcon, 
  ArrowDownIcon 
} from '@heroicons/react/24/outline';
import { 
  PieChart, Pie, Cell, Tooltip as RechartsTooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';

export const KPICard = ({ title, value, subValue, trend, icon: Icon, colorClass }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col justify-between h-full">
      <div className="flex justify-between items-start mb-2">
        <div className={`p-2.5 rounded-lg ${colorClass.bg} ${colorClass.text}`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <div className="flex items-center text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-md">
            <ArrowUpIcon className="w-3 h-3 mr-1" />
            {trend}
          </div>
        )}
      </div>
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
        <div className="text-2xl font-bold text-gray-900">{value}</div>
        {subValue && <div className="text-xs text-gray-400 mt-1">{subValue}</div>}
      </div>
    </div>
  );
};

export const CustomDonutChart = ({ data, colors, title, centerText }) => {
  const validData = data && data.length > 0 ? data : [{ name: 'No Data', value: 1, percent: 100 }];
  
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <h3 className="text-sm font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex-1 relative">
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={validData}
              innerRadius={55}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              stroke="none"
            >
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <RechartsTooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-gray-500">{centerText.label}</span>
          <span className="text-xl font-bold text-gray-900">{centerText.value}</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-1 xl:grid-cols-2 gap-2">
        {validData.map((entry, index) => {
          if (entry.name === 'No Data') return null;
          return (
            <div key={index} className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colors[index % colors.length] }} />
                <span className="text-gray-600 truncate max-w-[80px]" title={entry.name}>{entry.name}</span>
              </div>
              <div className="font-semibold text-gray-900">
                {Number(entry.value).toLocaleString()} <span className="text-gray-400 font-normal ml-1">({entry.percent}%)</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export const CustomBarChart = ({ data, title }) => {
  const validData = data && data.length > 0 ? data : [];
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full flex flex-col">
      <h3 className="text-sm font-bold text-gray-800 mb-4">{title}</h3>
      <div className="flex-1">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={validData} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
            <RechartsTooltip 
              cursor={{ fill: '#f9fafb' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
              {validData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
