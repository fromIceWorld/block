class Router {
    static hash: string = '';
    static subscribers: Array<any> = [];
    constructor() {
        this.listenHashChange();
    }
    listenHashChange() {
        let router = Router;
        window.addEventListener(
            'hashchange',
            function ($e) {
                let newHash = location.hash.substring(1),
                    paths = newHash.split('/');
                console.log('The hash has changed!', router.hash, paths);
                router.hash = newHash;
                router.subscribers.forEach((com) => {
                    com.detectChanges();
                });
            },
            false
        );
    }
    static subscribe(com) {
        this.subscribers.push(com);
    }
}
export { Router };
