import {
  AnimationOptions,
  BackgroundColorOptions,
  SetOverlaysWebViewOptions,
  StatusBarInfo,
  Style,
  StyleOptions,
} from '~@capacitor/status-bar';
export { Style } from '~@capacitor/status-bar';

export const StatusBar = {
  getInfo(): Promise<StatusBarInfo> {
    return Promise.resolve({ visible: true, style: Style.Default });
  },
  hide(_options?: AnimationOptions): Promise<void> {
    return Promise.resolve(undefined);
  },
  setBackgroundColor(_options: BackgroundColorOptions): Promise<void> {
    return Promise.resolve(undefined);
  },
  setOverlaysWebView(_options: SetOverlaysWebViewOptions): Promise<void> {
    return Promise.resolve(undefined);
  },
  setStyle(_options: StyleOptions): Promise<void> {
    return Promise.resolve(undefined);
  },
  show(_options?: AnimationOptions): Promise<void> {
    return Promise.resolve(undefined);
  }
};
