export interface NavigationProps {
  
  navigate: (screenName: string, params?: any) => void;
  goBack: () => void;
  openDrawer: () => void;
  addListener: (type: string, callback: any) => void;
  reset : ({index , routes : []}, time : number)=>void
  }
