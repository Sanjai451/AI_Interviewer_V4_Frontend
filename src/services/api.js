const BASE = "/api";

async function req(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...options,
    ...(options.body ? { body: JSON.stringify(options.body) } : {}),
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.error || `Request failed: ${res.status}`);
  return data;
}

const get  = (url)        => req(url);
const post = (url, body)  => req(url, { method: "POST", body });
const put  = (url, body)  => req(url, { method: "PUT",  body });

export const api = {
  // Auth
  register: (data)          => post("/auth/register", data),
  login:    (data)          => post("/auth/login", data),
  getMe:    ()              => get("/auth/me"),
  updateProfile: (data)     => put("/auth/profile", data),

  // HR
  getHRStats:           ()       => get("/interviews/hr/stats"),
  getCandidates:        ()       => get("/interviews/hr/candidates"),
  getHRInterviews:      ()       => get("/interviews/hr/list"),
  analyzeJD:            (jd, r)  => post("/interviews/hr/analyze-jd", { jobDescription: jd, jobRole: r }),
  createInterview:      (data)   => post("/interviews/hr/create", data),
  generateFeedbackEmail:(id)     => post(`/interviews/hr/${id}/feedback-email`, {}),

  // Candidate
  getCandidateInterviews: ()             => get("/interviews/candidate/list"),
  startInterview:         (id)           => post(`/interviews/${id}/start`, {}),
  submitMCQ:              (id, a, p)     => post(`/interviews/${id}/submit-mcq`, { answers: a, proctorData: p }),

  // Virtual
  virtualNextQuestion:   (id, i)  => post(`/interviews/${id}/virtual/next-question`, { currentQuestionIndex: i }),
  virtualSubmitResponse: (id, d)  => post(`/interviews/${id}/virtual/submit-response`, d),
  completeVirtual:       (id, d)  => post(`/interviews/${id}/virtual/complete`, d),

  // Shared
  getInterview:   (id)    => get(`/interviews/${id}`),
  updateProctor:  (id, d) => post(`/interviews/${id}/proctor/update`, d),

  // ── Proctoring: early termination ─────────────────────────────────────────
  // reason: "look_away" | "tab_switch"
  terminateInterview: (id, reason, partialAnswers, proctorSnapshot, conversationHistory) =>
    post(`/interviews/${id}/terminate`, {
      reason,
      partialAnswers:      partialAnswers      || [],
      proctorSnapshot:     proctorSnapshot     || {},
      conversationHistory: conversationHistory || [],
    }),

  // ── Projects ───────────────────────────────────────────────────────────────
  listProjects:   ()       => get("/projects"),
  createProject:  (data)   => post("/projects", data),
  getProject:     (id)     => get(`/projects/${id}`),
  updateProject:  (id, d)  => put(`/projects/${id}`, d),
  deleteProject:  (id)     => req(`/projects/${id}`, { method: "DELETE" }),

  // Bulk-assign: create interviews for multiple candidates in one project
  bulkAssign: (projectId, data) => post(`/projects/${projectId}/bulk-assign`, data),
};
