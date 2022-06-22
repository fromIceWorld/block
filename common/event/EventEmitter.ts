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
        Object.defineProperty(this.event.detail, 'value', {
            value: emitValue,
        });
        (this.event.detail as any).dom.dispatchEvent(this.event);
    }
}
export { EventEmitter };
