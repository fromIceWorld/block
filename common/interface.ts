interface ObjectInterface<V> {
    [key: string]: V;
    [key: symbol]: V;
}
interface ConstructortInterface {
    new (): any;
    constructor: Function;
    [key: string | symbol]: any;
}
export { ObjectInterface, ConstructortInterface };
