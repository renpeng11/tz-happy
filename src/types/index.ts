export interface SpotData {
  icon: string;
  xhsUrl: string;
  imageCount: number;
  folder: string;
  description: string;
}

export interface WeatherDay {
  day: string;
  icon: string;
  temp: string;
  tempColor: string;
  details: string;
}

export interface ItineraryStep {
  icon: string;
  text: string;
}

export interface RouteDay {
  day: number;
  title: string;
  details: string;
  spots: string[];
  itinerary: ItineraryStep[];
}

export interface RouteData {
  id: number;
  title: string;
  scheme: string;
  description: string;
  drivingTime?: string;
  days: RouteDay[];
}

export interface User {
  id: number;
  nickname: string;
  avatar: string;
  hasVoted: boolean;
  votedRoute: number | null;
}

export interface VoteData {
  [key: number]: number;
}

export interface VoteContextType {
  voteData: VoteData;
  currentUser: User | null;
  isLoading: boolean;
  castVote: (routeId: number) => Promise<boolean>;
  clearAllVotes: () => Promise<void>;
  login: () => Promise<void>;
}

export interface ExpenseItem {
  id: string;
  name: string;
  amount: number;
  category: string;
  time: string;
  userId: string;
  userName: string;
  userAvatar: string;
}

export interface DayExpense {
  day: number;
  expenses: ExpenseItem[];
  total: number;
}

export interface RouteExpenses {
  routeId: number;
  days: DayExpense[];
  total: number;
}
