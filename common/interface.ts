interface ObjectInterface<V> {
    [key: string]: V;
    [key: symbol]: V;
}
interface ConstructortInterface {
    new (): any;
    [key: string]: any;
}
export { ObjectInterface, ConstructortInterface };
