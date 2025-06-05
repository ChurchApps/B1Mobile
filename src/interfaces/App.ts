export interface NavigationProps {
  navigate: (screenName: string, params?: any) => void;
  goBack: () => void;
  openDrawer: () => void;
  addListener: (type: string, callback: any) => void;
  reset: (params: { index: number; routes: any[] }, time: number) => void;
}
