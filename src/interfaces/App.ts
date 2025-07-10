export interface NavigationProps {
  navigate: (screenName: string, params?: Record<string, unknown>) => void;
  goBack: () => void;
  openDrawer: () => void;
  addListener: (type: string, callback: (...args: unknown[]) => void) => void;
  reset: (params: { index: number; routes: Array<Record<string, unknown>> }, time: number) => void;
}
