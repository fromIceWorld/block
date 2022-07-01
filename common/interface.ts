interface ObjectInterface<V> {
    [key: string]: V;
    [key: symbol]: V;
}
interface ConstructortInterface {
    new (): any;
    constructor: Function;
    [key: string]: any;
}
export { ObjectInterface, ConstructortInterface };
