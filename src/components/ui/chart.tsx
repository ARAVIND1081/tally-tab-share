
import { BarChart as RechartBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  name: string;
  value: number;
}

interface BarChartProps {
  data: ChartData[];
  currencySymbol?: string;
}

export const BarChart = ({ data, currencySymbol = '$' }: BarChartProps) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartBarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis 
          dataKey="name" 
          angle={-45}
          textAnchor="end"
          height={60}
          tick={{ fontSize: 12 }}
        />
        <YAxis />
        <Tooltip 
          formatter={(value) => [`${currencySymbol}${Number(value).toFixed(2)}`, 'Amount paid']} 
          labelStyle={{ fontWeight: 'bold' }}
        />
        <Bar dataKey="value" fill="#14b8a6" barSize={40} />
      </RechartBarChart>
    </ResponsiveContainer>
  );
};
