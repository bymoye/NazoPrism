const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number): T => {
    let timer: ReturnType<typeof setTimeout>;
    return function (this: any, ...args: any[]) {
        if (timer) {
            clearTimeout(timer);
        }
        timer = setTimeout(() => {
            fn.apply(this, args);
        }, delay);
    } as T;
};

export default debounce;
