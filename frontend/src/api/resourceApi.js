import { http } from './http';

const unwrap = (request) => request.then((res) => res.data);
const data = (request) => request.then((res) => res.data.data);

function query(params = {}) {
  return { params: Object.fromEntries(Object.entries(params).filter(([, value]) => value !== '' && value !== undefined && value !== null)) };
}

export const organizationsApi = {
  list: (params) => unwrap(http.get('/organizations', query(params))),
  create: (payload) => data(http.post('/organizations', payload)),
  get: (id) => data(http.get(`/organizations/${id}`)),
  update: (id, payload) => data(http.patch(`/organizations/${id}`, payload)),
  remove: (id) => data(http.delete(`/organizations/${id}`)),
  addMember: (id, payload) => data(http.post(`/organizations/${id}/members`, payload)),
  removeMember: (id, userId) => data(http.delete(`/organizations/${id}/members/${userId}`))
};

export const projectsApi = {
  list: (params) => unwrap(http.get('/projects', query(params))),
  create: (payload) => data(http.post('/projects', payload)),
  get: (id) => data(http.get(`/projects/${id}`)),
  update: (id, payload) => data(http.patch(`/projects/${id}`, payload)),
  remove: (id) => data(http.delete(`/projects/${id}`)),
  addMember: (id, payload) => data(http.post(`/projects/${id}/members`, payload)),
  removeMember: (id, userId) => data(http.delete(`/projects/${id}/members/${userId}`))
};

export const queuesApi = {
  list: (params) => unwrap(http.get('/queues', query(params))),
  create: (payload) => data(http.post('/queues', payload)),
  get: (id) => data(http.get(`/queues/${id}`)),
  update: (id, payload) => data(http.patch(`/queues/${id}`, payload)),
  remove: (id) => data(http.delete(`/queues/${id}`)),
  pause: (id) => data(http.post(`/queues/${id}/pause`)),
  resume: (id) => data(http.post(`/queues/${id}/resume`)),
  statistics: (id) => data(http.get(`/queues/${id}/statistics`))
};

export const retryPoliciesApi = {
  list: (params) => unwrap(http.get('/retry-policies', query(params))),
  create: (payload) => data(http.post('/retry-policies', payload)),
  update: (id, payload) => data(http.patch(`/retry-policies/${id}`, payload)),
  remove: (id) => data(http.delete(`/retry-policies/${id}`))
};

export const jobsApi = {
  list: (params) => unwrap(http.get('/jobs', query(params))),
  create: (payload) => data(http.post('/jobs', payload)),
  createBatch: (payload) => data(http.post('/jobs/batch', payload)),
  get: (id) => data(http.get(`/jobs/${id}`)),
  update: (id, payload) => data(http.patch(`/jobs/${id}`, payload)),
  cancel: (id) => data(http.post(`/jobs/${id}/cancel`)),
  transition: (id, payload) => data(http.post(`/jobs/${id}/transition`, payload)),
  remove: (id) => data(http.delete(`/jobs/${id}`))
};

export const workersApi = {
  list: (params) => unwrap(http.get('/workers', query(params))),
  register: (payload) => data(http.post('/workers', payload)),
  claim: (payload) => data(http.post('/workers/claim', payload)),
  recover: () => data(http.post('/workers/recover-abandoned')),
  heartbeat: (id, payload) => data(http.post(`/workers/${id}/heartbeat`, payload)),
  drain: (id) => data(http.post(`/workers/${id}/drain`)),
  stop: (id) => data(http.post(`/workers/${id}/stop`)),
  complete: (id, payload) => data(http.post(`/workers/jobs/${id}/complete`, payload)),
  fail: (id, payload) => data(http.post(`/workers/jobs/${id}/fail`, payload))
};

export const deadLetterApi = {
  list: (params) => unwrap(http.get('/dead-letter-jobs', query(params))),
  get: (id) => data(http.get(`/dead-letter-jobs/${id}`)),
  retry: (id) => data(http.post(`/dead-letter-jobs/${id}/retry`)),
  remove: (id) => data(http.delete(`/dead-letter-jobs/${id}`))
};

export const logsApi = {
  jobLogs: (params) => unwrap(http.get('/logs/job-logs', query(params))),
  workerLogs: (params) => unwrap(http.get('/logs/worker-logs', query(params))),
  executions: (params) => unwrap(http.get('/logs/executions', query(params)))
};
