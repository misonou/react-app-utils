export default function createAsyncQueue() {
    let lastPromise;
    return async function (promise) {
        while (lastPromise) {
            let current = lastPromise;
            await current;
            // check if this invocation is the first being queued on the promise
            // to ensure each run is in sequence
            if (lastPromise === current) {
                break;
            }
        }
        lastPromise = promise();
        return lastPromise;
    };
}
