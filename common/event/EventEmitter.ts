let defaultConfig: CustomEventInit<any> = {
    bubbles: false,
    cancelable: true,
    composed: true,
    detail: {},
};
class EventEmitter<T> {
    event: CustomEvent<T>;
    constructor(type: string, additionConfig: CustomEventInit<T> = {}) {
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
