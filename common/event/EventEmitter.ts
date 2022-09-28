let defaultConfig: CustomEventInit = {
    bubbles: false,
    cancelable: true,
    composed: true,
    detail: {},
};
class EventEmitter {
    event: CustomEvent;
    constructor(type: string, additionConfig: CustomEventInit = {}) {
        this.event = new CustomEvent(
            type,
            Object.assign(defaultConfig, additionConfig)
        );
    }
    emit(emitValue: any) {
        if (this.event.detail.hasOwnProperty('value')) {
            this.event.detail['value'] = emitValue;
        } else {
            Object.defineProperty(this.event.detail, 'value', {
                value: emitValue,
                writable: true,
            });
        }
        (this.event.detail as any).dom.dispatchEvent(this.event);
    }
}
export { EventEmitter };
