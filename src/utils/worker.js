export function requestResponse(worker, data) {
  return new Promise((resolve) => {
    const _id = Math.random().toString(36).substr(2, 5);
    function onMessage(event) {
      if (event.data._id !== _id) return;
      worker.removeEventListener("message", onMessage);
      resolve(event.data);
    }
    worker.addEventListener("message", onMessage);
    worker.postMessage({ ...data, _id });
  });
}
