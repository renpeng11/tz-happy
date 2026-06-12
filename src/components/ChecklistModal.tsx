import { useState, useEffect } from "react";
import { useVote } from "../context/VoteContext";
import { checklistApi, type ChecklistItem } from "../api";

interface ChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChecklistModal({
  isOpen,
  onClose,
}: ChecklistModalProps) {
  const { currentUser } = useVote();
  const [items, setItems] = useState<ChecklistItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadChecklist();
    }
  }, [isOpen, currentUser?.id]);

  const loadChecklist = async (showLoading = true) => {
    if (showLoading) {
      setIsInitialLoading(true);
    }
    try {
      const data = await checklistApi.getList(currentUser?.id);
      setItems(data);
    } catch (error) {
      console.error("Failed to load checklist:", error);
    } finally {
      if (showLoading) {
        setIsInitialLoading(false);
      }
    }
  };

  const handleAddItem = async () => {
    if (!newItemName.trim()) return;

    setIsLoading(true);
    try {
      const data = await checklistApi.add(newItemName.trim());

      if (data.success) {
        setNewItemName("");
        await loadChecklist(false);
      }
    } catch (error) {
      console.error("Failed to add item:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleItem = async (itemId: number) => {
    if (!currentUser?.id) return;

    try {
      const data = await checklistApi.toggle(itemId, currentUser.id);

      if (data.success) {
        await loadChecklist(false);
      }
    } catch (error) {
      console.error("Failed to toggle item:", error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    if (!confirm("确定要删除这个项目吗？")) return;

    try {
      const data = await checklistApi.remove(itemId);

      if (data.success) {
        await loadChecklist(false);
      }
    } catch (error) {
      console.error("Failed to delete item:", error);
    }
  };

  const checkedCount = items.filter((item) => item.is_checked === 1).length;
  const totalCount = items.length;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <i className="fas fa-list-check text-purple-500 text-2xl" />
            <h3 className="text-xl font-bold text-text">必备清单</h3>
          </div>
          <button
            onClick={onClose}
            className="text-textLight hover:text-text transition-colors"
          >
            <i className="fas fa-times text-xl" />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
              style={{
                width:
                  totalCount > 0
                    ? `${(checkedCount / totalCount) * 100}%`
                    : "0%",
              }}
            />
          </div>
          <span className="text-sm text-textLight whitespace-nowrap">
            {checkedCount}/{totalCount}
          </span>
        </div>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="添加新项目..."
            className="flex-1 px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            onKeyPress={(e) => {
              if (e.key === "Enter") handleAddItem();
            }}
          />
          <button
            onClick={handleAddItem}
            disabled={isLoading || !newItemName.trim()}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-semibold hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <i className="fas fa-plus" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>

          {isInitialLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4" />
              <p className="text-textLight text-sm">加载中...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-box-open text-4xl text-gray-300 mb-3" />
              <p className="text-textLight">清单为空，添加一些物品吧！</p>
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-all ${item.is_checked === 1
                    ? "bg-green-50 border border-green-200"
                    : "bg-sky-50 hover:bg-sky-100"
                    }`}
                >
                  <button
                    onClick={() => handleToggleItem(item.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${item.is_checked === 1
                      ? "bg-green-500 border-green-500 text-white"
                      : "border-gray-300 hover:border-purple-500"
                      }`}
                  >
                    {item.is_checked === 1 && (
                      <i className="fas fa-check text-xs" />
                    )}
                  </button>

                  <div className="flex-1">
                    <span
                      className={`font-medium ${item.is_checked === 1
                        ? "text-gray-400 line-through"
                        : "text-text"
                        }`}
                    >
                      {item.name}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-red-400 hover:text-red-500 p-1 transition-colors"
                  >
                    <i className="fas fa-trash" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
