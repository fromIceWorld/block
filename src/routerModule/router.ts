class Router {
    hash: string = '';
    subscribers: Array<any> = [];
    constructor() {
        this.listenHashChange();
    }
    listenHashChange() {
        let router = this;
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
    getHash() {
        return this.hash;
    }
    subscribe(com) {
        this.subscribers.push(com);
    }
}
export { Router };
