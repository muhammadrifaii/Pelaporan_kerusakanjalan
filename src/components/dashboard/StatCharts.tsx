import React from 'react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, 
  BarChart, Bar, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { Card } from '../common/Card';

interface StatChartsProps {
  monthlyData: Array<{ name: string; reports: number }>;
  districtData: Array<{ name: string; count: number }>;
  severityData: Array<{ name: string; value: number; color: string }>;
  categoryData: Array<{ name: string; value: number }>;
}

export const StatCharts: React.FC<StatChartsProps> = ({
  monthlyData,
  districtData,
  severityData,
  categoryData
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      {/* 1. Monthly Report Trends */}
      <Card hoverEffect>
        <h4 className="text-base font-bold mb-4">Tren Laporan Bulanan</h4>
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.15)" />
              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" />
              <YAxis stroke="currentColor" className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.75rem',
                  color: 'hsl(var(--foreground))'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="reports" 
                stroke="hsl(var(--primary))" 
                fillOpacity={1} 
                fill="url(#colorReports)" 
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 2. Reports by District */}
      <Card hoverEffect>
        <h4 className="text-base font-bold mb-4">Laporan per Kecamatan</h4>
        <div className="h-80 w-full text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={districtData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.15)" />
              <XAxis dataKey="name" stroke="currentColor" className="text-muted-foreground" />
              <YAxis stroke="currentColor" className="text-muted-foreground" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.75rem',
                  color: 'hsl(var(--foreground))'
                }} 
              />
              <Bar dataKey="count" fill="hsl(var(--secondary))" radius={[8, 8, 0, 0]}>
                {districtData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--secondary))'} 
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 3. Reports by Severity */}
      <Card hoverEffect className="flex flex-col">
        <h4 className="text-base font-bold mb-4">Tingkat Kerusakan</h4>
        <div className="h-64 w-full flex-grow flex items-center justify-center text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.75rem',
                  color: 'hsl(var(--foreground))'
                }} 
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* 4. Reports by Category */}
      <Card hoverEffect className="flex flex-col">
        <h4 className="text-base font-bold mb-4">Laporan per Kategori</h4>
        <div className="h-64 w-full flex-grow flex items-center justify-center text-xs">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={0}
                outerRadius={80}
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                dataKey="value"
              >
                {categoryData.map((_, index) => {
                  const COLORS = [
                    '#0F4C81', '#1D9BF0', '#22C55E', '#F59E0B', 
                    '#EF4444', '#6366F1', '#A855F7', '#EC4899', '#14B8A6'
                  ];
                  return <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />;
                })}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  borderColor: 'hsl(var(--border))',
                  borderRadius: '0.75rem',
                  color: 'hsl(var(--foreground))'
                }} 
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
};
