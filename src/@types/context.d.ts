export interface IElectronAPI {
  update: (count: number) => void;
  openDialog: () => Promise<any>;
}

declare global {
  interface Window {
    myAPI: IElectronAPI;
  }
}
