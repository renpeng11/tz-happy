import { useState } from 'react';
import type { ExpenseItem, User } from '../types';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  user: User | null;
  onAdd: (day: number, expense: Omit<ExpenseItem, 'id'>) => void;
}

export default function ExpenseModal({ isOpen, onClose, day, user, onAdd }: ExpenseModalProps) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('餐饮');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;

    onAdd(day, {
      name,
      amount: parseFloat(amount),
      category,
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      userId: user?.id.toString() || '',
      userName: user?.nickname || '',
      userAvatar: user?.avatar || '',
    });

    setName('');
    setAmount('');
    setCategory('餐饮');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-bounceIn">
        <div className="bg-gradient-to-r from-primary to-secondary p-4 text-white">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">录入花销 - Day{day}</h3>
            <button onClick={onClose} className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors">
              <i className="fas fa-times" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label className="block text-sm font-semibold text-text mb-2">消费项目</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="请输入消费项目名称"
              className="w-full px-4 py-3 rounded-xl border border-sky-200 text-sm focus:outline-none focus:border-primary"
              autoFocus
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-semibold text-text mb-2">金额</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-textLight">¥</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-sky-200 text-sm focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-semibold text-text mb-2">消费分类</label>
            <div className="grid grid-cols-5 gap-2">
              {['餐饮', '交通', '住宿', '门票', '其他'].map(cat => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`px-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    category === cat
                      ? 'bg-gradient-to-r from-primary to-secondary text-white shadow-md'
                      : 'bg-sky-100 text-textLight hover:bg-sky-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary to-secondary text-white font-bold py-3 rounded-xl hover:shadow-lg transition-all"
          >
            <i className="fas fa-plus mr-2" />
            确认添加
          </button>
        </form>
      </div>
    </div>
  );
}