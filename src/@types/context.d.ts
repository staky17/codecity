export interface IElectronAPI {
  update: (count: number) => void;
  openDialog: () => Promise<string>;
  getCurrentConfig: () => Promise<any>;
  on: (channel: string, callback: any) => void;
}

declare global {
  interface Window {
    myAPI: IElectronAPI;
  }
}
