import GLib from 'gi://GLib';
import { Subject } from './Subject';

/**
 * A subscribe/notify mechanism that debounces multiple subsequent notify calls.
 */
export class DebouncingNotifier {
    private _subscribers: (() => void)[] = [];
    private _timeout: number | null = null;

    constructor(private _delayMs: number = 0) {}

    notify(): void {
        if (this._timeout) {
            return;
        }
        this._timeout = GLib.timeout_add(GLib.PRIORITY_DEFAULT, this._delayMs, () => {
            this._notify();
            this._timeout = null;
            return GLib.SOURCE_REMOVE;
        });
    }

    subscribe(callback: () => void, until?: Subject<void>): void {
        this._subscribers.push(callback);
        until?.subscribe(
            () => (this._subscribers = this._subscribers.filter((s) => s !== callback)),
        );
    }

    destroy(): void {
        if (this._timeout) {
            GLib.Source.remove(this._timeout);
            this._timeout = null;
        }
        this._subscribers = [];
    }

    private _notify(): void {
        for (const subscriber of this._subscribers) {
            subscriber();
        }
    }
}
