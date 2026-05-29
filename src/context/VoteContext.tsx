import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type { User, VoteData } from '../types';

interface VoteContextType {
  voteData: VoteData;
  currentUser: User | null;
  isLoading: boolean;
  castVote: (routeId: number) => Promise<boolean>;
  resetVote: () => void;
  clearAllVotes: () => void;
}

const VoteContext = createContext<VoteContextType | null>(null);

export function VoteProvider({ children }: { children: ReactNode }) {
  const [voteData, setVoteData] = useState<VoteData>({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 });
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVotes = useCallback(async () => {
    try {
      const response = await fetch("/api/votes");
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "获取投票数据失败");
      }

      const hasValidVotes = typeof result === 'object' && result !== null &&
        result.hasOwnProperty('1') && result.hasOwnProperty('7');

      if (hasValidVotes) {
        setVoteData(result);
      }
    } catch (error) {
      console.error("Failed to fetch votes:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const castVote = useCallback(async (routeId: number) => {
    if (!currentUser) {
      alert("请先登录");
      return false;
    }

    if (currentUser.hasVoted) {
      alert("您在本次端午出行决策中已经投过票啦，不可重复投票哦！");
      return false;
    }

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ routeId, userId: currentUser.id }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "投票失败");
      }

      const result = await response.json();
      if (result.success) {
        setVoteData(result.votes);
        setCurrentUser(prev => ({
          ...prev!,
          hasVoted: true,
          votedRoute: routeId,
        }));
        localStorage.setItem("current_user", JSON.stringify({
          ...currentUser,
          hasVoted: true,
          votedRoute: routeId,
        }));
        return true;
      } else if (result.error) {
        alert(result.error);
        return false;
      }
    } catch (error) {
      console.error("Failed to cast vote:", error);
      alert("投票失败，请检查网络连接或稍后重试");
      return false;
    }
    return false;
  }, [currentUser]);

  const resetVote = useCallback(async () => {
    if (!currentUser || !currentUser.hasVoted) {
      alert("您还没有投票，无需重置！");
      return;
    }

    if (!confirm("确定要重置投票吗？重置后您可以重新投票。")) {
      return;
    }

    try {
      const response = await fetch("/api/votes/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: currentUser.id, routeId: currentUser.votedRoute }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "重置投票失败");
      }

      const result = await response.json();
      if (result.success) {
        setVoteData(result.votes);
        setCurrentUser(prev => ({
          ...prev!,
          hasVoted: false,
          votedRoute: null,
        }));
        localStorage.removeItem("user_has_voted");
        localStorage.removeItem("user_voted_route");
        localStorage.setItem("current_user", JSON.stringify({
          ...currentUser,
          hasVoted: false,
          votedRoute: null,
        }));
        alert("投票已重置，您可以重新投票！");
      }
    } catch (error) {
      console.error("Failed to reset vote:", error);
      alert("重置投票失败，请检查网络连接或稍后重试");
    }
  }, [currentUser]);

  const clearAllVotes = useCallback(async () => {
    if (!confirm("确定要清空所有投票数据吗？此操作不可恢复！")) {
      return;
    }

    try {
      const response = await fetch("/api/votes/clear", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "清空投票失败");
      }

      const result = await response.json();
      if (result.success) {
        setVoteData(result.votes);
        alert("所有投票数据已清空！");
      }
    } catch (error) {
      console.error("Failed to clear votes:", error);
      alert("清空投票失败，请检查网络连接或稍后重试");
    }
  }, []);

  const autoLogin = useCallback(async () => {
    try {
      let fingerprint = localStorage.getItem("browser_fingerprint");
      if (!fingerprint) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.textBaseline = "top";
          ctx.font = "14px 'Arial'";
          ctx.fillStyle = "#f60";
          ctx.fillRect(125, 1, 62, 20);
          ctx.fillStyle = "#069";
          ctx.fillText("BrowserFingerprint", 2, 15);
          const canvasData = canvas.toDataURL();
          const components = [
            navigator.userAgent,
            navigator.language,
            screen.width + "x" + screen.height,
            new Date().getTimezoneOffset(),
            navigator.hardwareConcurrency || "unknown",
            canvasData,
            Array.from(navigator.plugins).map(p => p.name).join(","),
          ];
          fingerprint = "fp_" + components.join("|||").split("").reduce((a, b) => {
            a = (a << 5) - a + b.charCodeAt(0);
            return a & a;
          }, 0).toString(36) + Math.random().toString(36).substring(2, 8);
          localStorage.setItem("browser_fingerprint", fingerprint);
        } else {
          fingerprint = "fp_" + Math.random().toString(36).substring(2, 15);
          localStorage.setItem("browser_fingerprint", fingerprint);
        }
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fingerprint }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "登录失败");
      }

      const result = await response.json();
      if (result.success) {
        setCurrentUser(result.user);
        localStorage.setItem("current_user", JSON.stringify(result.user));
      }
    } catch (error) {
      console.error("Auto login failed:", error);
    }
  }, []);

  useEffect(() => {
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user data");
      }
    }
    fetchVotes();
    autoLogin();
  }, [fetchVotes, autoLogin]);

  return (
    <VoteContext.Provider value={{
      voteData,
      currentUser,
      isLoading,
      castVote,
      resetVote,
      clearAllVotes,
    }}>
      {children}
    </VoteContext.Provider>
  );
}

export function useVote() {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error("useVote must be used within a VoteProvider");
  }
  return context;
}
