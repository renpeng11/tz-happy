import { useRef } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useVote } from '../context/VoteContext';
import { routeLabels } from '../data/spots';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function VoteResults() {
  const { voteData, clearAllVotes, isLoading } = useVote();
  const chartRef = useRef<ChartJS<'bar'>>(null);

  const data = {
    labels: routeLabels,
    datasets: [
      {
        label: '得票数',
        data: Object.values(voteData),
        backgroundColor: [
          '#0d9488', '#0d9488', '#0d9488',
          '#3b82f6', '#3b82f6', '#3b82f6', '#3b82f6',
        ],
        borderRadius: 6,
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
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#f1f5f9' },
        ticks: { font: { size: 12 } },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 11 }, maxRotation: 45, minRotation: 45 },
      },
    },
  };

  if (isLoading) {
    return (
      <div className="results-panel bg-white rounded-[20px] p-6 mt-7 shadow-lg border border-sky-100">
        <h2 className="text-center text-lg font-extrabold text-sky-800 mb-4 flex items-center justify-center gap-2">
          <i className="fas fa-chart-pie" />
          实时选线投票统计看板
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="results-panel bg-white rounded-[20px] p-6 mt-7 shadow-lg border border-sky-100" id="results">
      <h2 className="text-center text-lg font-extrabold text-sky-800 mb-5 flex items-center justify-center gap-2">
        <i className="fas fa-chart-pie" />
        实时选线投票统计看板
      </h2>
      <div className="chart-container h-[280px] w-full">
        <Bar ref={chartRef} data={data} options={options} />
      </div>
      <p className="text-center text-textLight text-sm mt-4">
        * 投票数据由服务器统一管理，实时同步更新
      </p>
      <div className="text-center mt-4">
        <button
          onClick={clearAllVotes}
          className="bg-gradient-to-r from-red-500 to-red-400 text-white font-semibold text-sm px-5 py-3 rounded-lg flex items-center gap-2 mx-auto hover:shadow-md transition-all"
        >
          <i className="fas fa-trash-alt" />
          清空所有投票
        </button>
      </div>
    </div>
  );
}
