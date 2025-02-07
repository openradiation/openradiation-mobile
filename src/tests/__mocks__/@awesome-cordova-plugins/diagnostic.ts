export class Diagnostic {
    static getLocationAuthorizationStatus(): Promise<unknown> {
        return Promise.resolve("GRANTED");
    }

    static isLocationAvailable(): Promise<boolean> {
        return Promise.resolve(true);
    }

    static isLocationEnabled(): Promise<boolean> {
        return Promise.resolve(true);
    }

    static isGpsLocationEnabled(): Promise<boolean> {
        return Promise.resolve(true);
    }

    static requestLocationAuthorization(_mode?: string, _accuracy?: string): Promise<string> {
        return Promise.resolve(this.permissionStatus.GRANTED)
    }

    static registerBluetoothStateChangeHandler(_handler: Function) {
        // Do nothing in this mock
    }

    static registerLocationStateChangeHandler(_handler: Function) {
        // Do nothing in this mock
    }

    static switchToSettings(): Promise<boolean> {
        return Promise.resolve(true);
    }

    static switchToBluetoothSettings(): Promise<boolean> {
        return Promise.resolve(true);
    }

    static permissionStatus: {
        GRANTED: string;
        /**
         * @deprecated cordova.plugins.diagnostic@5.0.0 uses DENIED_ONCE to unify DENIED* statuses across iOS/Android
         */
        DENIED: string;
        DENIED_ONCE: string;
        NOT_REQUESTED: string;
        DENIED_ALWAYS: string;
        RESTRICTED: string;
        GRANTED_WHEN_IN_USE: string;
        EPHEMERAL: string;
        PROVISIONAL: string;
        LIMITED: string;
    };
    static locationAuthorizationMode: {
        ALWAYS: string;
        WHEN_IN_USE: string;
    };
    static bluetoothState: {
        UNKNOWN: string;
        RESETTING: string;
        UNSUPPORTED: string;
        UNAUTHORIZED: string;
        POWERED_OFF: string;
        POWERED_ON: string;
        POWERING_OFF: string;
        POWERING_ON: string;
    };
}

Diagnostic.permissionStatus = {
    GRANTED: "GRANTED",
    GRANTED_WHEN_IN_USE: "GRANTED_WHEN_IN_USE",
    NOT_REQUESTED: "NOT_REQUESTED",
    DENIED: "DENIED",
    DENIED_ALWAYS: "DENIED_ALWAYS",
    DENIED_ONCE: "DENIED_ONCE",
    RESTRICTED: "RESTRICTED",
    EPHEMERAL: "EPHEMERAL",
    PROVISIONAL: "PROVISIONAL",
    LIMITED: "LIMITED",
};
Diagnostic.bluetoothState = {
    UNKNOWN: "UNKNOWN",
    RESETTING: "RESETTING",
    UNSUPPORTED: "UNSUPPORTED",
    UNAUTHORIZED: "UNAUTHORIZED",
    POWERED_OFF: "POWERED_OFF",
    POWERED_ON: "POWERED_ON",
    POWERING_OFF: "POWERING_OFF",
    POWERING_ON: "POWERING_ON",
};

Diagnostic.locationAuthorizationMode = {
    ALWAYS: "ALWAYS",
    WHEN_IN_USE: "WHEN_IN_USE"
};