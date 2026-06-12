import { useState, useEffect } from "react";
import { useVote } from "../context/VoteContext";
import { decisionApi, type DecisionOption, type Decision } from "../api";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewMode = "list" | "create" | "vote" | "result" | "announcement" | "ai-create";

interface AIMessage {
  role: "user" | "assistant";
  content: string;
}

interface GeneratedVote {
  title: string;
  description: string;
  options: string[];
}

const durationOptions = [
  { value: "1h", label: "1小时" },
  { value: "3h", label: "3小时" },
  { value: "5h", label: "5小时" },
  { value: "1d", label: "1天" },
];

const WHEEL_SPIN_ROUNDS = 5;
const WHEEL_POINTER_ANGLE = -90;
const WHEEL_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#a855f7",
];

const normalizeDegrees = (degrees: number) => ((degrees % 360) + 360) % 360;

const getWheelSegmentCenterAngle = (index: number, optionsCount: number) =>
  -90 + (index + 0.5) * (360 / optionsCount);

const getWheelTargetRotation = (
  selectedIndex: number,
  optionsCount: number,
  currentRotation: number,
) => {
  const currentNormalizedRotation = normalizeDegrees(currentRotation);
  const selectedSegmentCenter = getWheelSegmentCenterAngle(
    selectedIndex,
    optionsCount,
  );
  const targetNormalizedRotation = normalizeDegrees(
    WHEEL_POINTER_ANGLE - selectedSegmentCenter,
  );
  const rotationDelta = normalizeDegrees(
    targetNormalizedRotation - currentNormalizedRotation,
  );

  return currentRotation + WHEEL_SPIN_ROUNDS * 360 + rotationDelta;
};

const getWheelLabelLines = (text: string, optionsCount: number) => {
  const trimmedText = text.trim();
  const maxChars = optionsCount <= 2 ? 8 : optionsCount <= 4 ? 6 : 4;

  if (trimmedText.length <= maxChars) {
    return [trimmedText];
  }

  const firstLine = trimmedText.slice(0, maxChars);
  const secondLineLimit = maxChars;
  const secondLineText = trimmedText.slice(
    maxChars,
    maxChars + secondLineLimit,
  );
  const secondLine =
    trimmedText.length > maxChars + secondLineLimit
      ? `${secondLineText.slice(0, Math.max(1, secondLineLimit - 1))}…`
      : secondLineText;

  return [firstLine, secondLine];
};

export default function DecisionModal({ isOpen, onClose }: DecisionModalProps) {
  const { currentUser } = useVote();
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("1d");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [currentDecisionId, setCurrentDecisionId] = useState<number | null>(
    null,
  );
  const [decisionOptions, setDecisionOptions] = useState<DecisionOption[]>([]);
  const [userVoted, setUserVoted] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [countdowns, setCountdowns] = useState<Record<number, string>>({});
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [voteMode, setVoteMode] = useState<"direct" | "random">("direct");
  const [isSpinningCompleted, setIsSpinningCompleted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);
  const [isReopening, setIsReopening] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmOption, setConfirmOption] = useState<{
    id: number;
    text: string;
  } | null>(null);

  const [shouldRefreshOnOpen, setShouldRefreshOnOpen] = useState(true);

  // AI 创建相关状态
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [generatedVote, setGeneratedVote] = useState<GeneratedVote | null>(null);
  const [aiSelectedDuration, setAiSelectedDuration] = useState("1d");

  useEffect(() => {
    if (isOpen && viewMode === "list" && shouldRefreshOnOpen) {
      setIsLoading(true);
      loadDecisions();
      setShouldRefreshOnOpen(false);
    }
  }, [isOpen, viewMode, shouldRefreshOnOpen]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const newCountdowns: Record<number, string> = {};
      decisions.forEach((decision) => {
        if (decision.expires_at) {
          const expires = new Date(decision.expires_at).getTime();
          const diff = expires - now;
          if (diff <= 0) {
            // 已结束的投票不显示倒计时
          } else {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor(
              (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
            );
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);
            if (days > 0) {
              newCountdowns[decision.id] = `${days}天 ${hours}时 ${minutes}分`;
            } else if (hours > 0) {
              newCountdowns[decision.id] =
                `${hours}时 ${minutes}分 ${seconds}秒`;
            } else {
              newCountdowns[decision.id] = `${minutes}分 ${seconds}秒`;
            }
          }
        }
      });
      setCountdowns(newCountdowns);
    }, 1000);

    return () => clearInterval(timer);
  }, [decisions]);

  const isExpired = (decision: Decision) => {
    if (!decision.expires_at) return false;
    return new Date(decision.expires_at) < new Date();
  };

  const loadDecisions = async () => {
    try {
      const result = await decisionApi.getList();
      setDecisions(result || []);
    } catch (error) {
      console.error("Failed to load decisions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddOption = () => {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  };

  // AI 创建相关函数
  const handleAISubmit = async () => {
    if (!currentUser) {
      alert("请先登录");
      return;
    }

    if (!aiInput.trim()) {
      return;
    }

    const userMessage = aiInput.trim();
    setAiInput("");
    setAiMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setAiLoading(true);

    try {
      const result = await decisionApi.aiCreate({
        userInput: userMessage,
        userId: currentUser.id,
        duration: aiSelectedDuration,
      });

      if (result.success) {
        setGeneratedVote(result.generated);
        setAiMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `我帮你生成了一个投票方案：\n\n📌 标题：${result.generated.title}\n📝 说明：${result.generated.description}\n\n🎯 选项：\n${result.generated.options.map((o, i) => `${i + 1}. ${o}`).join("\n")}\n\n确认后我将创建这个投票。`,
          },
        ]);
      }
    } catch (error: any) {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `抱歉，生成投票时出现问题：${error?.message || "请稍后重试"}`,
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const handleConfirmAIVote = async () => {
    if (!currentUser || !generatedVote) return;

    setIsLoading(true);
    setViewMode("create");

    try {
      // 填充创建表单
      setTitle(generatedVote.title);
      setDescription(generatedVote.description);
      setOptions(generatedVote.options.map((o) => o));
      setSelectedDuration(aiSelectedDuration);

      // 触发创建
      await handleCreate();

      // 重置 AI 状态
      setGeneratedVote(null);
      setAiMessages([]);
    } catch (error) {
      console.error("Failed to create vote:", error);
      setViewMode("ai-create");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAIVote = () => {
    setGeneratedVote(null);
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const handleCreate = async () => {
    if (!currentUser) {
      alert("请先登录");
      return;
    }

    const validOptions = options.filter((o) => o.trim());
    if (validOptions.length < 2) {
      alert("至少需要2个有效选项");
      return;
    }

    if (!title.trim()) {
      alert("请输入投票标题");
      return;
    }

    setIsLoading(true);

    try {
      const result = await decisionApi.create({
        title: title.trim(),
        description: description.trim(),
        options: validOptions,
        userId: currentUser.id,
        duration: selectedDuration,
      });

      // 重置表单数据
      setTitle("");
      setDescription("");
      setSelectedDuration("1d");
      setOptions(["", ""]);

      setCurrentDecisionId(result.decisionId);
      await loadDecisionOptions(result.decisionId);
      await loadDecisions();
      setShouldRefreshOnOpen(true);
      setViewMode("vote");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDecisionOptions = async (decisionId: number) => {
    try {
      const result = await decisionApi.getDetail(decisionId);

      if (result.options) {
        setDecisionOptions(result.options);
      }

      if (currentUser) {
        const voteResult = await decisionApi.getUserVote(decisionId, currentUser.id);
        if (voteResult.hasVoted) {
          setUserVoted(voteResult.votedOptionId);
        }
      }
    } catch (error) {
      console.error("Failed to load decision:", error);
    }
  };

  const handleReopenVote = async () => {
    if (!currentUser || !currentDecisionId) return;

    setIsReopening(true);
    try {
      const result = await decisionApi.reopen(currentDecisionId, currentUser.id);

      // 切换到新创建的投票
      setCurrentDecisionId(result.decisionId);
      await loadDecisionOptions(result.decisionId);
      await loadDecisions();
      setShouldRefreshOnOpen(true);
      setViewMode("vote");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsReopening(false);
    }
  };

  const handleCreateFromTie = async (tieOptionTexts: string[]) => {
    if (!currentUser || !currentDecisionId) return;

    setIsReopening(true);
    try {
      const result = await decisionApi.recreateFromTie(currentDecisionId, currentUser.id, tieOptionTexts);

      // 切换到新创建的投票
      setCurrentDecisionId(result.decisionId);
      await loadDecisionOptions(result.decisionId);
      await loadDecisions();
      setShouldRefreshOnOpen(true);
      setViewMode("vote");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsReopening(false);
    }
  };

  const handleSelectDecision = async (decisionId: number) => {
    const decision = decisions.find((d) => d.id === decisionId);
    setIsLoading(true);
    setCurrentDecisionId(decisionId);
    await loadDecisionOptions(decisionId);

    if (decision && isExpired(decision)) {
      setViewMode("announcement");
    } else {
      const hasVoted = userVoted !== null;
      setViewMode(hasVoted ? "result" : "vote");
    }

    setIsLoading(false);
  };

  const handleVote = async (optionId: number) => {
    if (!currentUser || userVoted || !currentDecisionId) return;

    const decision = decisions.find((d) => d.id === currentDecisionId);
    if (decision && isExpired(decision)) {
      alert("该投票已结束");
      return;
    }

    const option = decisionOptions.find((o) => o.id === optionId);
    if (option) {
      setConfirmOption({ id: optionId, text: option.text });
      setShowConfirmModal(true);
    }
  };

  const handleSpinWheel = () => {
    if (!currentUser || userVoted || isSpinning || !currentDecisionId) return;

    const decision = decisions.find((d) => d.id === currentDecisionId);
    if (decision && isExpired(decision)) {
      alert("该投票已结束");
      return;
    }

    const optionsCount = decisionOptions.length;
    if (optionsCount === 0) return;

    setIsSpinning(true);
    setIsSpinningCompleted(false);
    setSelectedOptionId(null);

    const randomIndex = Math.floor(Math.random() * optionsCount);
    const selectedOption = decisionOptions[randomIndex];
    const targetRotation = getWheelTargetRotation(
      randomIndex,
      optionsCount,
      rotation,
    );

    setTimeout(() => {
      setRotation(targetRotation);
    }, 100);

    setTimeout(() => {
      setIsSpinning(false);
      setIsSpinningCompleted(true);
      setSelectedOptionId(selectedOption.id);
    }, 4000);
  };

  const confirmVote = async () => {
    if (!confirmOption || !currentUser || userVoted || !currentDecisionId)
      return;

    setShowConfirmModal(false);
    setIsLoading(true);

    try {
      const result = await decisionApi.vote(currentDecisionId, confirmOption.id, currentUser.id);

      setDecisionOptions(result.options);
      setUserVoted(confirmOption.id);
      setViewMode("result");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setViewMode("list");
    setTitle("");
    setSelectedDuration("1d");
    setOptions(["", ""]);
    setCurrentDecisionId(null);
    setDecisionOptions([]);
    setUserVoted(null);
    setIsSpinning(false);
    setIsSpinningCompleted(false);
    setSelectedOptionId(null);
    setVoteMode("direct");
    setShouldRefreshOnOpen(true);
    // 重置 AI 状态
    setAiMessages([]);
    setAiInput("");
    setGeneratedVote(null);
    setAiSelectedDuration("1d");
    onClose();
  };

  const handleDeleteDecision = async (decisionId: number) => {
    if (!confirm("确定要删除这个投票吗？")) {
      return;
    }

    try {
      const data = await decisionApi.remove(decisionId);
      if (data.success) {
        // 直接刷新，不需要设置 shouldRefreshOnOpen，避免重复刷新
        loadDecisions();
      }
    } catch (error) {
      alert("删除失败，请重试");
    }
  };

  const handleBack = () => {
    if (viewMode === "create") {
      setViewMode("list");
      setTitle("");
      setDescription("");
      setSelectedDuration("1d");
      setOptions(["", ""]);
    } else if (viewMode === "ai-create") {
      setViewMode("list");
      setAiMessages([]);
      setAiInput("");
      setGeneratedVote(null);
      setAiSelectedDuration("1d");
    } else if (
      viewMode === "vote" ||
      viewMode === "result" ||
      viewMode === "announcement"
    ) {
      setViewMode("list");
      setCurrentDecisionId(null);
      setDecisionOptions([]);
      setUserVoted(null);
      setIsSpinning(false);
      setIsSpinningCompleted(false);
      setSelectedOptionId(null);
      setVoteMode("direct");
      // 只有从个人投票结果页返回时才刷新，因为投票后数据有变化
      if (viewMode === "result") {
        setShouldRefreshOnOpen(true);
      }
    }
  };

  const totalVotes = decisionOptions.reduce((sum, o) => sum + o.votes, 0);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Shanghai",
    });
  };

  const currentDecision = decisions.find((d) => d.id === currentDecisionId);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-xl max-h-[80vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {(viewMode === "create" ||
              viewMode === "ai-create" ||
              viewMode === "vote" ||
              viewMode === "result" ||
              viewMode === "announcement") && (
                <button
                  onClick={handleBack}
                  className="text-textLight hover:text-text transition-colors"
                >
                  <i className="fas fa-arrow-left" />
                </button>
              )}
            <i className="fas fa-question-circle text-purple-500 text-2xl" />
            <h3 className="text-xl font-bold text-text">
              {viewMode === "list"
                ? "遇事不决？"
                : viewMode === "create"
                  ? "创建投票"
                  : viewMode === "ai-create"
                    ? "AI 创建投票"
                    : viewMode === "result"
                      ? "投票结果"
                      : viewMode === "announcement"
                        ? "投票结果公布"
                        : "投票"}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className="text-textLight hover:text-text transition-colors"
          >
            <i className="fas fa-times text-xl" />
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
          {viewMode === "list" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-textLight text-sm">加载中...</p>
                </div>
              ) : (
                <>
                  <p className="text-textLight text-sm">
                    选择一个投票进行决策，或创建新投票：
                  </p>

                  {decisions.length === 0 ? (
                    <div className="text-center py-8">
                      <i className="fas fa-inbox text-4xl text-sky-200 mb-3" />
                      <p className="text-textLight">暂无投票</p>
                      <p className="text-textLight text-sm">
                        点击下方按钮创建第一个投票
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {decisions.map((decision) => {
                        const expired = isExpired(decision);
                        return (
                          <div
                            key={decision.id}
                            className={`relative p-4 rounded-xl ${expired ? "bg-gray-50" : "bg-sky-50"
                              }`}
                          >
                            <button
                              onClick={() => handleSelectDecision(decision.id)}
                              className={`w-full text-left transition-colors pr-10 ${expired
                                ? "bg-gray-50 hover:bg-gray-100"
                                : "hover:bg-sky-100"
                                }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-text">
                                  {decision.title || "未命名投票"}
                                </div>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${expired
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-green-100 text-green-600"
                                    }`}
                                >
                                  {expired ? "已结束" : "进行中"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-textLight">
                                <span>
                                  {decision.option_count} 个选项 ·{" "}
                                  {decision.total_votes} 票
                                </span>
                                {countdowns[decision.id] && (
                                  <span className="text-orange-500">
                                    {countdowns[decision.id]}
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-textLight mt-1">
                                {formatDate(decision.created_at)}
                              </div>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDecision(decision.id);
                              }}
                              className="absolute top-3 right-3 p-1.5 text-textLight hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              title="删除投票"
                            >
                              <i className="fas fa-trash-alt" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setViewMode("create")}
                      className="py-3 border-2 border-dashed border-purple-200 text-purple-500 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-plus" />
                      创建投票
                    </button>
                    <button
                      onClick={() => setViewMode("ai-create")}
                      className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:shadow-md transition-colors flex items-center justify-center gap-2"
                    >
                      <i className="fas fa-robot" />
                      AI 创建
                    </button>
                  </div>
                </>
              )}
            </div>
          )}

          {viewMode === "ai-create" && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg">
                <i className="fas fa-lightbulb" />
                <span>告诉 AI 你想做什么，它会帮你生成投票选项</span>
              </div>

              {/* 时长选择 */}
              <div>
                <label className="text-xs text-textLight mb-2 block">
                  投票有效时间
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setAiSelectedDuration(option.value)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${aiSelectedDuration === option.value
                        ? "bg-emerald-500 text-white"
                        : "bg-sky-50 text-text hover:bg-sky-100"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 聊天消息区域 */}
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {aiMessages.length === 0 && (
                  <div className="text-center text-textLight text-sm py-4">
                    <i className="fas fa-comment-dots text-2xl mb-2 text-emerald-200" />
                    <p>开始描述你想要投票的内容吧~</p>
                    <p className="text-xs mt-1">
                      例如："周末去爬山还是看海？"
                    </p>
                  </div>
                )}
                {aiMessages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${msg.role === "user"
                        ? "bg-emerald-500 text-white"
                        : "bg-sky-100 text-text"
                        }`}
                      style={{ whiteSpace: "pre-wrap" }}
                    >
                      {msg.content}
                    </div>
                  </div>
                ))}
                {aiLoading && (
                  <div className="flex justify-start">
                    <div className="bg-sky-100 text-text px-3 py-2 rounded-xl">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                        </div>
                        <span className="text-xs text-textLight">AI 思考中...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 生成投票预览 */}
              {generatedVote && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
                  <div className="font-semibold text-text">
                    {generatedVote.title}
                  </div>
                  <div className="text-sm text-textLight">
                    {generatedVote.description}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedVote.options.map((option, index) => (
                      <span
                        key={index}
                        className="bg-white px-3 py-1 rounded-full text-sm text-text border border-emerald-200"
                      >
                        {option}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={handleConfirmAIVote}
                      disabled={isLoading}
                      className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-600 transition-colors disabled:opacity-50"
                    >
                      {isLoading ? "创建中..." : "确认创建"}
                    </button>
                    <button
                      onClick={handleCancelAIVote}
                      className="px-4 py-2 border border-gray-300 text-text rounded-lg text-sm hover:bg-gray-50 transition-colors"
                    >
                      重新生成
                    </button>
                  </div>
                </div>
              )}

              {/* 输入框 */}
              {!generatedVote && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleAISubmit();
                      }
                    }}
                    placeholder="描述你想投票的内容..."
                    className="flex-1 px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={handleAISubmit}
                    disabled={aiLoading || !aiInput.trim()}
                    className="bg-emerald-500 text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <i className={`fas ${aiLoading ? "fa-spinner fa-spin" : "fa-paper-plane"}`} />
                  </button>
                </div>
              )}
            </div>
          )}

          {viewMode === "create" && (
            <div className="space-y-4">
              <p className="text-textLight text-sm">
                创建投票，输入标题和选项：
              </p>

              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="投票标题"
                className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
                maxLength={50}
              />

              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="投票说明（可选）"
                className="w-full px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm resize-none"
                maxLength={200}
                rows={3}
              />

              <div>
                <label className="text-xs text-textLight mb-2 block">
                  有效时间
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {durationOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setSelectedDuration(option.value)}
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${selectedDuration === option.value
                        ? "bg-purple-500 text-white"
                        : "bg-sky-50 text-text hover:bg-sky-100"
                        }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {options.map((option, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={option}
                      onChange={(e) =>
                        handleOptionChange(index, e.target.value)
                      }
                      placeholder={`选项 ${index + 1}`}
                      className="flex-1 px-3 py-2 border border-sky-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                    {options.length > 2 && (
                      <button
                        onClick={() => handleRemoveOption(index)}
                        className="text-red-400 hover:text-red-500 p-2"
                      >
                        <i className="fas fa-minus-circle" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {options.length < 6 && (
                <button
                  onClick={handleAddOption}
                  className="w-full py-2 border-2 border-dashed border-sky-200 text-textLight rounded-lg hover:border-primary hover:text-primary transition-colors mb-4 text-sm"
                >
                  <i className="fas fa-plus mr-2" />
                  添加选项
                </button>
              )}

              <button
                onClick={handleCreate}
                disabled={
                  isLoading ||
                  !title.trim() ||
                  options.filter((o) => o.trim()).length < 2
                }
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin" />
                    创建中...
                  </>
                ) : (
                  <>
                    <i className="fas fa-vote-yea" />
                    创建投票
                  </>
                )}
              </button>
            </div>
          )}

          {viewMode === "vote" && (
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-textLight text-sm">加载中...</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-text">
                        {currentDecision?.title || "未命名投票"}
                      </div>
                      {currentDecision?.description && (
                        <div className="text-sm text-textLight mt-1">
                          {currentDecision.description}
                        </div>
                      )}
                      {currentDecision && (
                        <div className="text-xs text-textLight mt-1">
                          {countdowns[currentDecision.id]}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-textLight">
                      {totalVotes} 票
                    </span>
                  </div>

                  {currentDecision &&
                    !userVoted &&
                    !isExpired(currentDecision) && (
                      <div className="flex bg-sky-50 rounded-xl p-1">
                        <button
                          onClick={() => setVoteMode("direct")}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${voteMode === "direct"
                            ? "bg-white text-text shadow-sm"
                            : "text-textLight hover:text-text"
                            }`}
                        >
                          <i className="fas fa-hand-pointer mr-1.5" />
                          我有想法
                        </button>
                        <button
                          onClick={() => {
                            setVoteMode("random");
                            setIsSpinningCompleted(false);
                            setSelectedOptionId(null);
                          }}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${voteMode === "random"
                            ? "bg-white text-text shadow-sm"
                            : "text-textLight hover:text-text"
                            }`}
                        >
                          <i className="fas fa-shuffle mr-1.5" />
                          我都可以
                        </button>
                      </div>
                    )}

                  <p className="text-textLight text-sm">
                    {currentDecision && isExpired(currentDecision)
                      ? "投票已结束，查看结果："
                      : userVoted
                        ? "已投票，请查看结果："
                        : voteMode === "direct"
                          ? "请选择你的意向："
                          : "让命运决定："}
                  </p>

                  <div className="space-y-3">
                    {(userVoted || voteMode === "direct") && (
                      <>
                        {decisionOptions.map((option) => {
                          const isSelected = userVoted === option.id;
                          const expired = currentDecision
                            ? isExpired(currentDecision)
                            : false;

                          return (
                            <button
                              key={option.id}
                              onClick={() => handleVote(option.id)}
                              disabled={
                                !!userVoted ||
                                isLoading ||
                                expired ||
                                voteMode === "random"
                              }
                              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${isSelected
                                ? "bg-purple-100 border-2 border-purple-400"
                                : "bg-sky-50 hover:bg-sky-100"
                                } ${userVoted || isLoading || expired || voteMode === "random" ? "cursor-default" : "hover:shadow-sm"}`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="text-text font-medium">
                                  {option.text}
                                </span>
                              </div>
                              {userVoted && (
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-textLight">
                                    {option.votes} 票
                                  </span>
                                </div>
                              )}
                            </button>
                          );
                        })}
                      </>
                    )}

                    {voteMode === "random" && !userVoted && (
                      <div className="relative">
                        <div className="flex justify-center">
                          <div className="relative w-64 h-64">
                            <svg
                              className={`w-full h-full transition-transform duration-[4000ms] ease-out rounded-full ${isSpinning ? "" : "shadow-xl"}`}
                              style={{ transform: `rotate(${rotation}deg)` }}
                              viewBox="0 0 200 200"
                            >
                              <circle
                                cx="100"
                                cy="100"
                                r="98"
                                fill="#f3f4f6"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                              />
                              {decisionOptions.map((option, index) => {
                                const optionsCount = decisionOptions.length;
                                const startAngle =
                                  (360 / optionsCount) * index - 90;
                                const endAngle =
                                  startAngle + 360 / optionsCount;
                                const startRad = (startAngle * Math.PI) / 180;
                                const endRad = (endAngle * Math.PI) / 180;
                                const x1 = 100 + 90 * Math.cos(startRad);
                                const y1 = 100 + 90 * Math.sin(startRad);
                                const x2 = 100 + 90 * Math.cos(endRad);
                                const y2 = 100 + 90 * Math.sin(endRad);
                                const largeArcFlag =
                                  endAngle - startAngle > 180 ? 1 : 0;
                                const labelAngle =
                                  startAngle + 360 / optionsCount / 2;
                                const labelRad = (labelAngle * Math.PI) / 180;
                                const labelX = 100 + 55 * Math.cos(labelRad);
                                const labelY = 100 + 55 * Math.sin(labelRad);
                                const labelLines = getWheelLabelLines(
                                  option.text,
                                  optionsCount,
                                );
                                const labelFontSize =
                                  labelLines.length > 1 ? 9 : 11;

                                return (
                                  <g key={option.id}>
                                    <path
                                      d={`M 100 100 L ${x1} ${y1} A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                      fill={
                                        WHEEL_COLORS[
                                        index % WHEEL_COLORS.length
                                        ]
                                      }
                                      stroke="white"
                                      strokeWidth="1"
                                    />
                                    <text
                                      x={labelX}
                                      y={labelY}
                                      fill="white"
                                      fontSize={labelFontSize}
                                      fontWeight="bold"
                                      textAnchor="middle"
                                      dominantBaseline="middle"
                                      transform={`rotate(${labelAngle + 90}, ${labelX}, ${labelY})`}
                                    >
                                      {labelLines.map((line, lineIndex) => (
                                        <tspan
                                          key={`${option.id}-${lineIndex}`}
                                          x={labelX}
                                          dy={
                                            lineIndex === 0
                                              ? labelLines.length > 1
                                                ? "-5"
                                                : "0"
                                              : "11"
                                          }
                                        >
                                          {line}
                                        </tspan>
                                      ))}
                                    </text>
                                  </g>
                                );
                              })}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                              <svg width="64" height="64" viewBox="0 0 64 64">
                                <defs>
                                  <linearGradient
                                    id="centerArrowGradient"
                                    x1="0%"
                                    y1="0%"
                                    x2="100%"
                                    y2="0%"
                                  >
                                    <stop offset="0%" stopColor="#dc2626" />
                                    <stop offset="100%" stopColor="#991b1b" />
                                  </linearGradient>
                                </defs>
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="30"
                                  fill="white"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M32 8 L48 26 L42 26 L42 56 L22 56 L22 26 L16 26 Z"
                                  fill="url(#centerArrowGradient)"
                                  stroke="#991b1b"
                                  strokeWidth="1"
                                />
                              </svg>
                            </div>
                          </div>
                        </div>

                        {!isSpinning && !isSpinningCompleted && (
                          <button
                            onClick={handleSpinWheel}
                            disabled={!currentDecisionId}
                            className="w-full mt-4 bg-gradient-to-r from-orange-400 to-red-500 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            <i className="fas fa-play" />
                            开始转动轮盘
                          </button>
                        )}

                        {isSpinningCompleted && (
                          <div className="flex gap-3 mt-4">
                            <button
                              onClick={handleSpinWheel}
                              disabled={isLoading}
                              className="flex-1 bg-gray-100 text-text font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <i className="fas fa-redo" />
                              重新转动
                            </button>
                            <button
                              onClick={() => {
                                const selectedOption = decisionOptions.find(
                                  (o) => o.id === selectedOptionId,
                                );
                                if (selectedOption) {
                                  setConfirmOption({
                                    id: selectedOption.id,
                                    text: selectedOption.text,
                                  });
                                  setShowConfirmModal(true);
                                }
                              }}
                              disabled={isLoading}
                              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                              <i className="fas fa-check" />
                              确认投票
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {viewMode === "result" && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl p-4 text-center text-white mb-4">
                <div className="text-3xl mb-2">🎉</div>
                <div className="font-bold text-lg">投票成功！</div>
                <div className="text-sm opacity-90 mt-1">感谢你的参与</div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-text">
                    {currentDecision?.title || "未命名投票"}
                  </div>
                  {currentDecision?.description && (
                    <div className="text-sm text-textLight mt-1">
                      {currentDecision.description}
                    </div>
                  )}
                  {currentDecision && (
                    <div className="text-xs text-textLight mt-1">
                      {countdowns[currentDecision.id]}
                    </div>
                  )}
                </div>
                <span className="text-xs text-textLight">{totalVotes} 票</span>
              </div>

              <p className="text-textLight text-sm">投票结果：</p>

              <div className="space-y-3">
                {decisionOptions.map((option) => {
                  const isSelected = userVoted === option.id;

                  return (
                    <div
                      key={option.id}
                      className={`w-full text-left px-4 py-3 rounded-xl ${isSelected
                        ? "bg-purple-100 border-2 border-purple-400"
                        : "bg-sky-50"
                        }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <i className="fas fa-check-circle text-purple-500" />
                          )}
                          <span className="text-text font-medium">
                            {option.text}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-textLight">
                            {option.votes} 票
                          </span>
                          {isSelected && (
                            <span className="text-xs text-purple-500 font-medium">
                              你的选择
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {viewMode === "announcement" && (
            <div className="space-y-4">
              {(() => {
                // 计算总票数
                const totalVotesCount = decisionOptions.reduce(
                  (sum, option) => sum + option.votes,
                  0,
                );

                // 找到最高票数
                const maxVotes = Math.max(
                  ...decisionOptions.map((o) => o.votes),
                );

                // 找到所有票数等于最高票数的选项
                const topOptions = decisionOptions.filter(
                  (o) => o.votes === maxVotes,
                );
                const hasTie = topOptions.length > 1 && maxVotes > 0;
                const hasNoVotes = totalVotesCount === 0;
                const hasWinner =
                  !hasNoVotes && !hasTie && topOptions.length === 1;

                return (
                  <>
                    {/* 情况1：没有人投票 */}
                    {hasNoVotes && (
                      <div className="bg-gradient-to-r from-slate-400 to-slate-500 rounded-xl p-4 text-center text-white mb-4">
                        <div className="text-3xl mb-2">🤐</div>
                        <div className="font-bold text-lg">投票结果公布！</div>
                        <div className="text-sm opacity-90 mt-1">
                          没有人投票，要不要再开一次？
                        </div>
                      </div>
                    )}

                    {/* 情况2：有平票 */}
                    {hasTie && (
                      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 rounded-xl p-4 text-center text-white mb-4">
                        <div className="text-3xl mb-2">🤝</div>
                        <div className="font-bold text-lg">投票结果公布！</div>
                        <div className="text-sm opacity-90 mt-1">
                          平票了！要不要基于这些选项再投一次？
                        </div>
                      </div>
                    )}

                    {/* 情况3：有获胜者 */}
                    {hasWinner && (
                      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl p-4 text-center text-white mb-4">
                        <div className="text-3xl mb-2">🏆</div>
                        <div className="font-bold text-lg">投票结果公布！</div>
                        <div className="text-sm opacity-90 mt-1">
                          获胜项：{topOptions[0].text} ({topOptions[0].votes}{" "}
                          票)
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-text">
                          {currentDecision?.title || "未命名投票"}
                        </div>
                        {currentDecision?.description && (
                          <div className="text-sm text-textLight mt-1">
                            {currentDecision.description}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-textLight">
                        {totalVotesCount} 票
                      </span>
                    </div>

                    <p className="text-textLight text-sm">投票详情：</p>

                    <div className="space-y-3">
                      {decisionOptions.map((option) => {
                        const isWinner =
                          hasWinner && topOptions[0].id === option.id;
                        const isTie =
                          hasTie && topOptions.some((t) => t.id === option.id);

                        return (
                          <div
                            key={option.id}
                            className={`w-full text-left px-4 py-3 rounded-xl ${isWinner
                              ? "bg-green-100 border-2 border-green-400"
                              : isTie
                                ? "bg-blue-100 border-2 border-blue-400"
                                : "bg-sky-50"
                              }`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {isWinner && (
                                  <i className="fas fa-trophy text-green-500" />
                                )}
                                {isTie && (
                                  <i className="fas fa-handshake text-blue-500" />
                                )}
                                <span className="text-text font-medium">
                                  {option.text}
                                </span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-xs text-textLight">
                                  {option.votes} 票
                                </span>
                                {isWinner && (
                                  <span className="text-xs text-green-500 font-medium">
                                    获胜
                                  </span>
                                )}
                                {isTie && (
                                  <span className="text-xs text-blue-500 font-medium">
                                    平票
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* 没有人投票时显示重新开启按钮 */}
                    {hasNoVotes && (
                      <button
                        onClick={handleReopenVote}
                        disabled={isReopening}
                        className="w-full bg-gradient-to-r from-slate-500 to-slate-600 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isReopening ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            正在重新开启...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-redo" />
                            重新开启投票
                          </>
                        )}
                      </button>
                    )}

                    {/* 平票时显示创建新投票按钮 */}
                    {hasTie && (
                      <button
                        onClick={() =>
                          handleCreateFromTie(topOptions.map((t) => t.text))
                        }
                        disabled={isReopening}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                      >
                        {isReopening ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                            正在创建新投票...
                          </>
                        ) : (
                          <>
                            <i className="fas fa-plus-circle" />
                            基于平票选项创建新投票
                          </>
                        )}
                      </button>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      </div>

      {/* 确认投票弹窗 */}
      {
        showConfirmModal && confirmOption && (
          <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowConfirmModal(false);
              setConfirmOption(null);
            }}
          >
            <div
              className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-center">
                <div className="text-5xl mb-4">🤔</div>
                <h3 className="text-xl font-bold text-text mb-2">确认投票</h3>
                <p className="text-textLight mb-6">
                  你确定要选择：
                  <br />
                  <span className="font-semibold text-purple-600">
                    {confirmOption.text}
                  </span>
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setConfirmOption(null);
                    }}
                    className="flex-1 bg-gray-100 text-text font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all"
                  >
                    取消
                  </button>
                  <button
                    onClick={confirmVote}
                    disabled={isLoading}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                        投票中...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check" />
                        确认
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
