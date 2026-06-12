import { useState, useMemo, useEffect } from "react";
import { useVote } from "../context/VoteContext";
import { routesData } from "../data/spots";
import SpotCard from "./SpotCard";
import ExpenseChart from "./ExpenseChart";
import ExpenseModal from "./ExpenseModal";
import type { ExpenseItem, RouteExpenses } from "../types";
import { expenseApi } from "../api";

export default function ItineraryDetail() {
  const { voteData, currentUser, isLoading: isVoteLoading } = useVote();
  const [currentDay, setCurrentDay] = useState(1);
  const [showAllDays, setShowAllDays] = useState(false);
  const [expenses, setExpenses] = useState<RouteExpenses | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [expenseModalDay, setExpenseModalDay] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteData, setDeleteData] = useState<{
    day: number;
    expenseId: string;
  } | null>(null);

  const winnerRoute = useMemo(() => {
    let maxVotes = 0;
    let winnerRouteId = 1;

    Object.entries(voteData).forEach(([routeId, votes]) => {
      if (votes > maxVotes) {
        maxVotes = votes;
        winnerRouteId = parseInt(routeId);
      }
    });

    return routesData.find((r) => r.id === winnerRouteId) || null;
  }, [voteData]);

  const routeId = winnerRoute?.id || 1;

  useEffect(() => {
    if (!isVoteLoading) {
      loadExpenses();
    }
  }, [routeId, isVoteLoading]);

  const loadExpenses = async () => {
    setIsLoading(true);
    try {
      const data = await expenseApi.getList(routeId);

      const route = routesData.find((r) => r.id === routeId);
      if (!route) {
        setExpenses({ routeId, days: [], total: 0 });
        setIsLoading(false);
        return;
      }

      const daysExpenses = route.days.map((day) => {
        const dayExpenses = data.filter((exp: any) => exp.day === day.day);
        return {
          day: day.day,
          expenses: dayExpenses.map((exp: any) => ({
            id: exp.id.toString(),
            name: exp.name,
            amount: exp.amount,
            category: exp.category,
            time: exp.time,
            userId: exp.user_id || "",
            userName: exp.user_name || "未知用户",
            userAvatar: exp.user_avatar || "",
          })),
          total: dayExpenses.reduce(
            (sum: number, exp: any) => sum + exp.amount,
            0,
          ),
        };
      });

      setExpenses({
        routeId,
        days: daysExpenses,
        total: daysExpenses.reduce((sum, d) => sum + d.total, 0),
      });
    } catch (error) {
      console.error("Failed to load expenses:", error);
      const route = routesData.find((r) => r.id === routeId);
      if (route) {
        setExpenses({
          routeId,
          days: route.days.map((day) => ({
            day: day.day,
            expenses: [],
            total: 0,
          })),
          total: 0,
        });
      }
    }
    setIsLoading(false);
  };

  const addExpense = async (day: number, expense: Omit<ExpenseItem, "id">) => {
    try {
      const data = await expenseApi.add({
        routeId,
        day,
        ...expense,
      });

      if (data.success) {
        const newExpense = { ...expense, id: data.id.toString() };
        setExpenses((prev) => {
          if (!prev) return prev;
          const newDays = prev.days.map((d) => {
            if (d.day === day) {
              const newExpenses = [...d.expenses, newExpense];
              return {
                ...d,
                expenses: newExpenses,
                total: newExpenses.reduce((sum, e) => sum + e.amount, 0),
              };
            }
            return d;
          });
          return {
            ...prev,
            days: newDays,
            total: newDays.reduce((sum, d) => sum + d.total, 0),
          };
        });
      }
    } catch (error) {
      console.error("Failed to add expense:", error);
    }
  };

  const deleteExpense = async (day: number, expenseId: string) => {
    try {
      const data = await expenseApi.remove(expenseId);

      if (data.success) {
        setExpenses((prev) => {
          if (!prev) return prev;
          const newDays = prev.days.map((d) => {
            if (d.day === day) {
              const newExpenses = d.expenses.filter((e) => e.id !== expenseId);
              return {
                ...d,
                expenses: newExpenses,
                total: newExpenses.reduce((sum, e) => sum + e.amount, 0),
              };
            }
            return d;
          });
          return {
            ...prev,
            days: newDays,
            total: newDays.reduce((sum, d) => sum + d.total, 0),
          };
        });
      }
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const clearAllExpenses = async () => {
    try {
      const data = await expenseApi.clearAll(routeId);

      if (data.success) {
        setExpenses((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            days: prev.days.map((d) => ({ ...d, expenses: [], total: 0 })),
            total: 0,
          };
        });
      }
    } catch (error) {
      console.error("Failed to clear expenses:", error);
    }
  };

  const confirmDelete = async () => {
    if (!deleteData) return;
    await deleteExpense(deleteData.day, deleteData.expenseId);
    setShowDeleteConfirm(false);
    setDeleteData(null);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeleteData(null);
  };

  const ExpenseList = ({
    day,
    expenses,
  }: {
    day: number;
    expenses: ExpenseItem[];
  }) => {
    if (expenses.length === 0) return null;

    return (
      <div className="bg-white rounded-xl p-4 shadow-sm border border-sky-100">
        <div className="text-sm font-semibold text-text mb-3">花销明细</div>
        <div className="space-y-2">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="flex items-center justify-between p-2 bg-sky-50 rounded-lg"
            >
              <div className="flex items-center gap-3 flex-1">
                <img
                  src={expense.userAvatar}
                  alt={expense.userName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-text">
                    {expense.name}
                  </div>
                  <div className="text-xs text-textLight">
                    {expense.userName} · {expense.category} · {expense.time}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm font-bold text-primary">
                  ¥{expense.amount.toFixed(2)}
                </div>
                <button
                  onClick={() => {
                    setDeleteData({ day, expenseId: expense.id });
                    setShowDeleteConfirm(true);
                  }}
                  className="text-red-400 hover:text-red-500 text-xs"
                >
                  <i className="fas fa-trash" />
                </button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-sky-200 flex justify-between items-center">
          <span className="text-sm font-semibold text-textLight">当日总计</span>
          <span className="text-lg font-bold text-primary">
            ¥{expenses.reduce((sum, e) => sum + e.amount, 0).toFixed(2)}
          </span>
        </div>
      </div>
    );
  };

  if (!winnerRoute || isLoading || !expenses) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4" />
          <p className="text-textLight">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-[20px] p-4 shadow-lg border border-sky-100">
        <div className="flex justify-center gap-2">
          {winnerRoute.days.map((day) => (
            <button
              key={day.day}
              onClick={() => {
                setCurrentDay(day.day);
                setShowAllDays(false);
              }}
              className={`px-4 py-2 rounded-lg font-semibold transition-all ${!showAllDays && currentDay === day.day
                ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
                : "bg-sky-100 text-textLight hover:bg-sky-200"
                }`}
            >
              Day{day.day}
            </button>
          ))}
          <button
            onClick={() => setShowAllDays(true)}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${showAllDays
              ? "bg-gradient-to-r from-primary to-secondary text-white shadow-lg"
              : "bg-sky-100 text-textLight hover:bg-sky-200"
              }`}
          >
            全部
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={showAllDays ? "lg:col-span-2" : "lg:col-span-2"}>
          <div className="space-y-6">
            {winnerRoute.days.map((day) => {
              if (!showAllDays && day.day !== currentDay) return null;

              return (
                <div
                  key={day.day}
                  className="bg-white rounded-[20px] p-6 shadow-lg border border-sky-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="bg-gradient-to-r from-primary to-secondary text-white w-16 h-16 rounded-xl flex flex-col items-center justify-center font-extrabold shadow-md">
                      <span className="text-xs leading-none">DAY</span>
                      <span className="text-xl leading-none">{day.day}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-lg text-text">
                        {day.title}
                      </h3>
                      <p className="text-sm text-textLight">{day.details}</p>
                    </div>
                  </div>

                  {day.itinerary && day.itinerary.length > 0 && (
                    <div className="mb-4 bg-gradient-to-r from-sky-50 to-cyan-50 rounded-xl p-4">
                      <div className="text-sm font-semibold text-text mb-2">
                        行程安排
                      </div>
                      <div className="space-y-2">
                        {day.itinerary.map((step, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-sm text-textLight"
                          >
                            <i
                              className={`fas ${step.icon} text-primary w-4`}
                            />
                            <span>{step.text}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {day.spots && day.spots.length > 0 && (
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-text mb-3">
                        景点一览
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {day.spots.map((spotName) => {
                          const SpotCardComponent = SpotCard;
                          return (
                            <SpotCardComponent
                              key={spotName}
                              spotName={spotName}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={() => {
                      setExpenseModalDay(day.day);
                      setShowExpenseModal(true);
                    }}
                    className="w-full bg-gradient-to-r from-primary to-secondary text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all mb-4"
                  >
                    <i className="fas fa-plus mr-2" />
                    录入花销
                  </button>
                  <ExpenseList
                    day={day.day}
                    expenses={
                      expenses.days.find((d) => d.day === day.day)?.expenses ||
                      []
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <ExpenseChart
              expenses={expenses}
              onDeleteExpense={deleteExpense}
              onClearAll={clearAllExpenses}
            />
          </div>
        </div>
      </div>

      <ExpenseModal
        isOpen={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        day={expenseModalDay}
        user={currentUser}
        onAdd={addExpense}
      />

      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i className="fas fa-trash text-2xl text-red-500" />
              </div>
              <h3 className="text-lg font-bold text-text mb-2">确认删除</h3>
              <p className="text-textLight mb-6">
                确定要删除这条花销记录吗？此操作无法撤销。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={cancelDelete}
                  className="flex-1 px-4 py-2 border border-sky-200 text-text rounded-xl font-semibold hover:bg-sky-50 transition-all"
                >
                  取消
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 px-4 py-2 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all"
                >
                  确认删除
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
