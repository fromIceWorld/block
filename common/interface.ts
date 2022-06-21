interface ObjectInterface<V> {
    [key: string]: V;
}

type ObjectConstructor = { new (): any; [key: string]: any };
export { ObjectInterface, ObjectConstructor };
