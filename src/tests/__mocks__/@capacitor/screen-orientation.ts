import { OrientationLockOptions } from "~@capacitor/screen-orientation"

export const ScreenOrientation = {
    lock(_options: OrientationLockOptions): Promise<void> {
        return Promise.resolve();
    }
}