import { useState, useEffect } from "react";
import { useVote } from "../context/VoteContext";

interface DecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DecisionOption {
  id: number;
  text: string;
  votes: number;
}

interface Decision {
  id: number;
  title: string;
  description: string;
  created_at: string;
  expires_at: string;
  option_count: number;
  total_votes: number;
}

type ViewMode = "list" | "create" | "vote" | "result";

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
  const [showWheel, setShowWheel] = useState(false);
  const [voteMode, setVoteMode] = useState<"direct" | "random">("direct");
  const [isSpinningCompleted, setIsSpinningCompleted] = useState(false);
  const [selectedOptionId, setSelectedOptionId] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen && viewMode === "list") {
      setIsLoading(true);
      loadDecisions();
    }
  }, [isOpen, viewMode]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = Date.now();
      const newCountdowns: Record<number, string> = {};
      decisions.forEach((decision) => {
        if (decision.expires_at) {
          const expires = new Date(decision.expires_at).getTime();
          const diff = expires - now;
          if (diff <= 0) {
            newCountdowns[decision.id] = "已过期";
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
      const response = await fetch("/api/decisions");
      const result = await response.json();
      if (response.ok) {
        setDecisions(result || []);
      }
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
      const response = await fetch("/api/decisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          options: validOptions,
          userId: currentUser.id,
          duration: selectedDuration,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "创建失败");
      }

      setCurrentDecisionId(result.decisionId);
      await loadDecisionOptions(result.decisionId);
      await loadDecisions();
      setViewMode("vote");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDecisionOptions = async (decisionId: number) => {
    try {
      const response = await fetch(`/api/decisions/${decisionId}`);
      const result = await response.json();

      if (response.ok && result.options) {
        setDecisionOptions(result.options);
      }

      if (currentUser) {
        const voteResponse = await fetch(
          `/api/decisions/${decisionId}/user-vote?userId=${currentUser.id}`,
        );
        const voteResult = await voteResponse.json();
        if (voteResult.hasVoted) {
          setUserVoted(voteResult.votedOptionId);
        }
      }
    } catch (error) {
      console.error("Failed to load decision:", error);
    }
  };

  const handleSelectDecision = async (decisionId: number) => {
    const decision = decisions.find((d) => d.id === decisionId);
    if (decision && isExpired(decision)) {
      alert("该投票已过期");
      return;
    }
    setIsLoading(true);
    setCurrentDecisionId(decisionId);
    await loadDecisionOptions(decisionId);
    const hasVoted = userVoted !== null;
    setViewMode(hasVoted ? "result" : "vote");
    setIsLoading(false);
  };

  const handleVote = async (optionId: number) => {
    if (!currentUser || userVoted || !currentDecisionId) return;

    const decision = decisions.find((d) => d.id === currentDecisionId);
    if (decision && isExpired(decision)) {
      alert("该投票已过期");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/decisions/${currentDecisionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId,
          userId: currentUser.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "投票失败");
      }

      setDecisionOptions(result.options);
      setUserVoted(optionId);
      setViewMode("result");
    } catch (error) {
      alert((error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpinWheel = () => {
    if (!currentUser || userVoted || isSpinning || !currentDecisionId) return;

    const decision = decisions.find((d) => d.id === currentDecisionId);
    if (decision && isExpired(decision)) {
      alert("该投票已过期");
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
    if (!selectedOptionId || !currentUser || !currentDecisionId) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/decisions/${currentDecisionId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          optionId: selectedOptionId,
          userId: currentUser.id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "投票失败");
      }

      setDecisionOptions(result.options);
      setUserVoted(selectedOptionId);
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
    onClose();
  };

  const handleDeleteDecision = async (decisionId: number) => {
    if (!confirm("确定要删除这个投票吗？")) {
      return;
    }

    try {
      const response = await fetch(`/api/decisions/${decisionId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        loadDecisions();
      } else {
        const result = await response.json();
        alert(result.error || "删除失败");
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
    } else if (viewMode === "vote" || viewMode === "result") {
      setViewMode("list");
      setCurrentDecisionId(null);
      setDecisionOptions([]);
      setUserVoted(null);
      loadDecisions();
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
            <i className="fas fa-question-circle text-purple-500 text-2xl" />
            <h3 className="text-xl font-bold text-text">
              {viewMode === "list"
                ? "遇事不决？"
                : viewMode === "create"
                  ? "创建投票"
                  : "投票"}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {(viewMode === "create" || viewMode === "vote") && (
              <button
                onClick={handleBack}
                className="text-textLight hover:text-text transition-colors mr-2"
              >
                <i className="fas fa-arrow-left" />
              </button>
            )}
            <button
              onClick={handleClose}
              className="text-textLight hover:text-text transition-colors"
            >
              <i className="fas fa-times text-xl" />
            </button>
          </div>
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
                            className={`relative p-4 rounded-xl ${
                              expired ? "bg-gray-50" : "bg-sky-50"
                            }`}
                          >
                            <button
                              onClick={() => handleSelectDecision(decision.id)}
                              disabled={expired}
                              className={`w-full text-left transition-colors pr-10 ${
                                expired
                                  ? "cursor-not-allowed opacity-60"
                                  : "hover:bg-sky-100"
                              }`}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="font-semibold text-text">
                                  {decision.title || "未命名投票"}
                                </div>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded-full ${
                                    expired
                                      ? "bg-red-100 text-red-600"
                                      : "bg-green-100 text-green-600"
                                  }`}
                                >
                                  {expired ? "已过期" : "进行中"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between text-xs text-textLight">
                                <span>
                                  {decision.option_count} 个选项 ·{" "}
                                  {decision.total_votes} 票
                                </span>
                                <span
                                  className={
                                    expired ? "text-red-500" : "text-orange-500"
                                  }
                                >
                                  {countdowns[decision.id]}
                                </span>
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

                  <button
                    onClick={() => setViewMode("create")}
                    className="w-full py-3 border-2 border-dashed border-purple-200 text-purple-500 rounded-xl hover:bg-purple-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-plus" />
                    创建新投票
                  </button>
                </>
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
                      className={`py-2 rounded-lg text-xs font-medium transition-colors ${
                        selectedDuration === option.value
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
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            voteMode === "direct"
                              ? "bg-white text-text shadow-sm"
                              : "text-textLight hover:text-text"
                          }`}
                        >
                          <i className="fas fa-hand-pointer mr-1.5" />
                          我有想法
                        </button>
                        <button
                          onClick={() => setVoteMode("random")}
                          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                            voteMode === "random"
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
                          const percentage =
                            totalVotes > 0
                              ? Math.round((option.votes / totalVotes) * 100)
                              : 0;
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
                              className={`w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                                isSelected
                                  ? "bg-purple-100 border-2 border-purple-400"
                                  : "bg-sky-50 hover:bg-sky-100"
                              } ${userVoted || isLoading || expired || voteMode === "random" ? "cursor-default" : "hover:shadow-sm"}`}
                            >
                              <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-text font-medium">
                                    {option.text}
                                  </span>
                                  {userVoted && (
                                    <span className="text-purple-500 font-semibold text-sm">
                                      {percentage}%
                                    </span>
                                  )}
                                </div>
                                {userVoted && (
                                  <div className="w-full bg-sky-100 rounded-full h-1.5">
                                    <div
                                      className="bg-purple-400 h-1.5 rounded-full transition-all"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                )}
                              </div>
                              {userVoted && option.votes > 0 && (
                                <span className="ml-2 text-xs text-textLight">
                                  {option.votes}票
                                </span>
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
                          <div className="space-y-3 mt-4">
                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 text-center">
                              <div className="text-green-600 font-semibold text-lg mb-1">
                                🎉 结果已出！
                              </div>
                              <div className="text-green-700 font-bold text-xl">
                                {decisionOptions.find(
                                  (o) => o.id === selectedOptionId,
                                )?.text || ""}
                              </div>
                            </div>
                            <div className="flex gap-3">
                              <button
                                onClick={() => {
                                  setIsSpinningCompleted(false);
                                  setSelectedOptionId(null);
                                }}
                                className="flex-1 bg-gray-100 text-text font-semibold py-3 rounded-xl hover:bg-gray-200 transition-all flex items-center justify-center gap-2"
                              >
                                <i className="fas fa-redo" />
                                重新转动
                              </button>
                              <button
                                onClick={confirmVote}
                                disabled={isLoading}
                                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                              >
                                <i className="fas fa-check" />
                                确认投票
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <button
                    onClick={handleBack}
                    disabled={isLoading}
                    className="w-full py-2 border border-sky-200 text-textLight rounded-xl hover:bg-sky-50 transition-all text-sm disabled:opacity-50"
                  >
                    返回列表
                  </button>
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
                  const percentage =
                    totalVotes > 0
                      ? Math.round((option.votes / totalVotes) * 100)
                      : 0;
                  const isSelected = userVoted === option.id;

                  return (
                    <div
                      key={option.id}
                      className={`w-full text-left px-4 py-3 rounded-xl ${
                        isSelected
                          ? "bg-purple-100 border-2 border-purple-400"
                          : "bg-sky-50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          {isSelected && (
                            <i className="fas fa-check-circle text-purple-500" />
                          )}
                          <span className="text-text font-medium">
                            {option.text}
                          </span>
                        </div>
                        <span className="text-purple-500 font-semibold text-sm">
                          {percentage}%
                        </span>
                      </div>
                      <div className="w-full bg-sky-100 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${isSelected ? "bg-purple-500" : "bg-purple-300"}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
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
                  );
                })}
              </div>

              <button
                onClick={handleBack}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-xl hover:shadow-md transition-all disabled:opacity-50"
              >
                返回投票列表
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
