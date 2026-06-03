import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import type { RouteExpenses } from '../types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ExpenseChartProps {
  expenses: RouteExpenses;
  onDeleteExpense: (day: number, expenseId: string) => void;
  onClearAll: () => void;
}

export default function ExpenseChart({ expenses, onDeleteExpense, onClearAll }: ExpenseChartProps) {
  const dailyData = {
    labels: expenses.days.map(d => `Day ${d.day}`),
    datasets: [
      {
        label: '每日花销',
        data: expenses.days.map(d => d.total),
        backgroundColor: [
          '#0d9488',
          '#3b82f6',
          '#f59e0b',
        ],
        borderRadius: 6,
      },
    ],
  };

  const categoryData = {
    labels: ['餐饮', '交通', '住宿', '门票', '其他'],
    datasets: [
      {
        data: [
          expenses.days.reduce((sum, day) => sum + day.expenses.filter(e => e.category === '餐饮').reduce((s, e) => s + e.amount, 0), 0),
          expenses.days.reduce((sum, day) => sum + day.expenses.filter(e => e.category === '交通').reduce((s, e) => s + e.amount, 0), 0),
          expenses.days.reduce((sum, day) => sum + day.expenses.filter(e => e.category === '住宿').reduce((s, e) => s + e.amount, 0), 0),
          expenses.days.reduce((sum, day) => sum + day.expenses.filter(e => e.category === '门票').reduce((s, e) => s + e.amount, 0), 0),
          expenses.days.reduce((sum, day) => sum + day.expenses.filter(e => e.category === '其他').reduce((s, e) => s + e.amount, 0), 0),
        ],
        backgroundColor: [
          '#0d9488',
          '#3b82f6',
          '#f59e0b',
          '#ef4444',
          '#8b5cf6',
        ],
        borderWidth: 2,
        borderColor: '#ffffff',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `¥${context.raw.toFixed(2)}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: {
          font: { size: 12 },
          callback: (value: any) => `¥${value}`,
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 } },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { size: 12 },
          padding: 15,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(30, 41, 59, 0.9)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 },
        padding: 12,
        cornerRadius: 8,
        callbacks: {
          label: (context: any) => `${context.label}: ¥${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  const userExpenses = expenses.days.reduce((acc, day) => {
    day.expenses.forEach(expense => {
      const userName = expense.userName || '未知用户';
      if (!acc[userName]) {
        acc[userName] = {
          amount: 0,
          avatar: expense.userAvatar,
        };
      }
      acc[userName].amount += expense.amount;
    });
    return acc;
  }, {} as Record<string, { amount: number; avatar?: string }>);

  const userLabels = Object.keys(userExpenses);
  const userAmounts = userLabels.map(name => userExpenses[name].amount);
  const userColors = [
    '#ec4899',
    '#8b5cf6',
    '#06b6d4',
    '#10b981',
    '#f59e0b',
    '#ef4444',
  ];

  const userData = {
    labels: userLabels,
    datasets: [
      {
        label: '用户花销',
        data: userAmounts,
        backgroundColor: userColors.slice(0, userLabels.length),
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="pb-6">
      <div className="space-y-6">
        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <i className="fas fa-chart-bar text-primary" />
            每日花销统计
          </h3>
          <div className="h-[200px]">
            <Bar data={dailyData} options={options} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <i className="fas fa-users text-primary" />
            用户花销统计
          </h3>
          <div className="h-[200px]">
            <Bar data={userData} options={options} />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-md">
          <h3 className="text-lg font-bold text-text mb-4 flex items-center gap-2">
            <i className="fas fa-chart-pie text-primary" />
            花销分类占比
          </h3>
          <div className="h-[200px]">
            <Pie data={categoryData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl p-6 text-white mt-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm opacity-90 mb-1">总花销</div>
            <div className="text-3xl font-extrabold">¥{expenses.total.toFixed(2)}</div>
          </div>
          <i className="fas fa-wallet text-4xl opacity-80" />
        </div>
      </div>
    </div>
  );
}