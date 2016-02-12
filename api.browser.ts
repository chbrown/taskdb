function post(url: string, body: any) {
  return fetch(url, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(body),
  }).then(res => res.json());
}

// appease the webpack run of the TypeScript compiler by giving api the type of `any`
const api: any = {};
[
  // task types
  'getTaskType',
  'getTaskTypes',
  'insertTaskType',
  'updateTaskType',
  // workers
  'getWorker',
  'getWorkers',
  'insertWorker',
  'updateWorker',
  // tasks
  'getTask',
  'getTasks',
  'insertTask',
  'updateTask',
  'nextTasks',
  'reserveTasks',
].forEach(key => {
  api[key] = (params) => post(`/api/${key}`, params);
});
export default api;
