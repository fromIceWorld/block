interface Route {
    component?: any;
    path: string;
    loadChildren?: Function;
    children?: Route[];
}

export { Route };
