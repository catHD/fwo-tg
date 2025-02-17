import type { Action, GameStatus, Player, PublicGameStatus } from '@fwo/schemas';
import { create } from 'zustand';

export type GameStoreState = {
  round: number;
  orders: {
    target: string;
    action: string;
    power: number;
  }[];
  players: Player[];
  canOrder: boolean;
  status: GameStatus[];
  statusByClan: Partial<Record<string, PublicGameStatus[]>>;
  power: number;
  actions: Action[];
  magics: Action[];
  skills: Action[];
  log: string[];
};

export type GameStoreActions = {
  setRound: (round: number) => void;
  setCanOrder: (canOrder: boolean) => void;
  setPower: (power: number) => void;
  setOrders: (orders: GameStoreState['orders']) => void;
  setStatus: (status: GameStatus[]) => void;
  setStatusByClan: (statusByClan: Partial<Record<string, PublicGameStatus[]>>) => void;
  setActions: (action: { actions: Action[]; magics: Action[]; skills: Action[] }) => void;
  pushLog: (log: string | string[]) => void;
  setPlayers: (players: Player[]) => void;
};

export type GameStore = GameStoreState & GameStoreActions;

export const useGameStore = create<GameStore>()((set, get) => ({
  round: 0,
  log: [],
  players: [],
  canOrder: false,
  actions: [],
  magics: [],
  skills: [],
  power: 0,
  orders: [],
  status: [],
  statusByClan: {},
  setRound: (round) => set({ round }),
  setCanOrder: (canOrder) => set({ canOrder }),
  setPower: (power) => set({ power }),
  setOrders: (orders) => set({ orders }),
  setStatus: (status) => set({ status }),
  setStatusByClan: (statusByClan) => set({ statusByClan }),
  setActions: (actions) => set(actions),
  setPlayers: (players) => set({ players }),
  pushLog: (log) => set((state) => ({ log: state.log.concat(Array.isArray(log) ? log : [log]) })),
}));
