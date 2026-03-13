import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import "../styles/viasocket.css";

const API_BASE = "http://127.0.0.1:8000";

const PLATFORM_OPTIONS = [
  { value: "leetcode", label: "LeetCode" },
  { value: "hackerrank", label: "HackerRank" },
  { value: "codeforces", label: "Codeforces" },
  { value: "codechef", label: "CodeChef" },
  { value: "geeksforgeeks", label: "GeeksForGeeks" },
  { value: "other", label: "Other" },
];

const DIFFICULTY_OPTIONS = [
  { value: "", label: "— Select —" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const STATUS_OPTIONS = [
  { value: "solved", label: "Solved" },
  { value: "attempted", label: "Attempted" },
  { value: "revisit", label: "Need to Revisit" },
];

function ViaSocketPage() {
  const [activeStep, setActiveStep] = useState(1);

  // Step 1 – API key
  const [apiKey, setApiKey] = useState(null);
  const [apiKeyLoading, setApiKeyLoading] = useState(false);
  const [apiKeyError, setApiKeyError] = useState("");
  const [copied, setCopied] = useState(false);

  // Step 3 – Test form
  const [testForm, setTestForm] = useState({
    title: "",
    platform: "leetcode",
    difficulty: "",
    status: "solved",
    notes: "",
    problem_url: "",
  });
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const authToken = localStorage.getItem("token");

  const fetchApiKey = useCallback(async () => {
    setApiKeyLoading(true);
    setApiKeyError("");
    try {
      const res = await axios.get(`${API_BASE}/api/viasocket/api-key/`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setApiKey(res.data.key);
    } catch (err) {
      setApiKeyError("Failed to load API key. Please ensure you are logged in.");
    } finally {
      setApiKeyLoading(false);
    }
  }, [authToken]);

  useEffect(() => {
    fetchApiKey();
  }, [fetchApiKey]);

  const handleRegenerateKey = async () => {
    if (!window.confirm("Regenerate API key? Your current ViaSocket action will stop working until updated.")) return;
    setApiKeyLoading(true);
    setApiKeyError("");
    try {
      const res = await axios.post(`${API_BASE}/api/viasocket/api-key/`, {}, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setApiKey(res.data.key);
    } catch (err) {
      setApiKeyError("Failed to regenerate API key.");
    } finally {
      setApiKeyLoading(false);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleTestFormChange = (e) => {
    const { name, value } = e.target;
    setTestForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestAction = async (e) => {
    e.preventDefault();
    if (!apiKey) {
      setTestResult({ success: false, message: "No API key found. Complete Step 1 first." });
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    try {
      const res = await axios.post(
        `${API_BASE}/api/viasocket/log-problem/`,
        testForm,
        { headers: { "X-API-Key": apiKey } }
      );
      setTestResult({ success: true, message: "✅ Problem logged successfully!", data: res.data.problem });
    } catch (err) {
      const errors = err.response?.data?.errors || err.response?.data || {};
      setTestResult({ success: false, message: "❌ Failed to log problem.", errors });
    } finally {
      setTestLoading(false);
    }
  };

  const webhookUrl = `${API_BASE}/api/viasocket/log-problem/`;

  return (
    <div className="vs-page">
      <div className="vs-header">
        <div className="vs-header-icon">⚡</div>
        <div>
          <h1 className="vs-title">ViaSocket Integration</h1>
          <p className="vs-subtitle">
            Automatically log your solved coding problems into CodeTrackr using ViaSocket workflows.
          </p>
        </div>
      </div>

      {/* Step progress bar */}
      <div className="vs-steps-bar">
        {[
          { n: 1, label: "Connect" },
          { n: 2, label: "Configure Action" },
          { n: 3, label: "Test" },
        ].map(({ n, label }) => (
          <button
            key={n}
            className={`vs-step-btn ${activeStep === n ? "active" : ""} ${activeStep > n ? "done" : ""}`}
            onClick={() => setActiveStep(n)}
          >
            <span className="vs-step-num">{activeStep > n ? "✓" : n}</span>
            <span className="vs-step-label">{label}</span>
          </button>
        ))}
        <div className="vs-steps-line" />
      </div>

      {/* ──────────────── STEP 1: Connect ──────────────── */}
      {activeStep === 1 && (
        <div className="vs-card">
          <h2 className="vs-card-title">
            <span className="vs-step-badge">1</span> Connect CodeTrackr to ViaSocket
          </h2>
          <p className="vs-card-desc">
            Your API key authenticates ViaSocket requests to CodeTrackr. Copy it and paste it into
            the ViaSocket action configuration as the <code>X-API-Key</code> header value.
          </p>

          {apiKeyError && <div className="vs-alert vs-alert-error">{apiKeyError}</div>}

          <div className="vs-field-row">
            <label className="vs-label">Your API Key</label>
            <div className="vs-key-box">
              {apiKeyLoading ? (
                <span className="vs-key-placeholder">Loading…</span>
              ) : (
                <span className="vs-key-value">{apiKey || "—"}</span>
              )}
              <div className="vs-key-actions">
                <button
                  className="vs-btn vs-btn-outline"
                  onClick={() => handleCopy(apiKey)}
                  disabled={!apiKey}
                  title="Copy API key"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <button
                  className="vs-btn vs-btn-ghost"
                  onClick={handleRegenerateKey}
                  disabled={apiKeyLoading}
                  title="Regenerate API key"
                >
                  Regenerate
                </button>
              </div>
            </div>
          </div>

          <div className="vs-info-box">
            <span className="vs-info-icon">ℹ️</span>
            <div>
              <strong>Keep your API key secret.</strong> Anyone with this key can log problems to
              your account. If you suspect it has been compromised, click <em>Regenerate</em>.
            </div>
          </div>

          <div className="vs-card-footer">
            <button className="vs-btn vs-btn-primary" onClick={() => setActiveStep(2)} disabled={!apiKey}>
              Next: Configure Action →
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── STEP 2: Configure Action ──────────────── */}
      {activeStep === 2 && (
        <div className="vs-card">
          <h2 className="vs-card-title">
            <span className="vs-step-badge">2</span> Configure the "Log Coding Problem" Action
          </h2>
          <p className="vs-card-desc">
            In ViaSocket, create an HTTP action with the settings below. Map fields from your
            trigger app (e.g. LeetCode solved event) to the body fields.
          </p>

          <div className="vs-config-grid">
            {/* Webhook URL */}
            <div className="vs-config-row">
              <div className="vs-config-label">Webhook URL</div>
              <div className="vs-config-value">
                <code className="vs-code-block">{webhookUrl}</code>
                <button className="vs-btn vs-btn-outline vs-btn-sm" onClick={() => handleCopy(webhookUrl)}>
                  Copy URL
                </button>
              </div>
            </div>

            {/* Method */}
            <div className="vs-config-row">
              <div className="vs-config-label">HTTP Method</div>
              <div className="vs-config-value">
                <span className="vs-badge vs-badge-green">POST</span>
              </div>
            </div>

            {/* Auth Header */}
            <div className="vs-config-row">
              <div className="vs-config-label">Authentication Header</div>
              <div className="vs-config-value vs-config-value-col">
                <div className="vs-header-pair">
                  <span className="vs-header-name">X-API-Key</span>
                  <span className="vs-header-sep">:</span>
                  <span className="vs-header-val">{apiKey || "<your-api-key>"}</span>
                </div>
              </div>
            </div>

            {/* Content-Type */}
            <div className="vs-config-row">
              <div className="vs-config-label">Content-Type</div>
              <div className="vs-config-value">
                <code>application/json</code>
              </div>
            </div>
          </div>

          {/* Fields table */}
          <h3 className="vs-section-heading">Request Body Fields</h3>
          <div className="vs-table-wrapper">
            <table className="vs-table">
              <thead>
                <tr>
                  <th>Field</th>
                  <th>Type</th>
                  <th>Required</th>
                  <th>Allowed Values</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>title</code></td>
                  <td>string</td>
                  <td><span className="vs-badge vs-badge-red">Yes</span></td>
                  <td>Any text</td>
                  <td>The name of the coding problem</td>
                </tr>
                <tr>
                  <td><code>platform</code></td>
                  <td>string</td>
                  <td><span className="vs-badge vs-badge-gray">No</span></td>
                  <td>
                    <code>leetcode</code>, <code>hackerrank</code>, <code>codeforces</code>,{" "}
                    <code>codechef</code>, <code>geeksforgeeks</code>, <code>other</code>
                  </td>
                  <td>Platform where you solved the problem</td>
                </tr>
                <tr>
                  <td><code>difficulty</code></td>
                  <td>string</td>
                  <td><span className="vs-badge vs-badge-gray">No</span></td>
                  <td><code>easy</code>, <code>medium</code>, <code>hard</code></td>
                  <td>Problem difficulty level</td>
                </tr>
                <tr>
                  <td><code>status</code></td>
                  <td>string</td>
                  <td><span className="vs-badge vs-badge-gray">No</span></td>
                  <td><code>solved</code>, <code>attempted</code>, <code>revisit</code></td>
                  <td>Your completion status (defaults to <code>solved</code>)</td>
                </tr>
                <tr>
                  <td><code>notes</code></td>
                  <td>string</td>
                  <td><span className="vs-badge vs-badge-gray">No</span></td>
                  <td>Any text</td>
                  <td>Personal notes or approach description</td>
                </tr>
                <tr>
                  <td><code>problem_url</code></td>
                  <td>string (URL)</td>
                  <td><span className="vs-badge vs-badge-gray">No</span></td>
                  <td>Valid URL</td>
                  <td>Direct link to the problem page</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Example payload */}
          <h3 className="vs-section-heading">Example JSON Payload</h3>
          <div className="vs-code-block vs-code-multi">
            <button
              className="vs-btn vs-btn-ghost vs-btn-sm vs-code-copy-btn"
              onClick={() =>
                handleCopy(
                  JSON.stringify(
                    {
                      title: "Two Sum",
                      platform: "leetcode",
                      difficulty: "easy",
                      status: "solved",
                      notes: "Used hashmap for O(n) solution",
                      problem_url: "https://leetcode.com/problems/two-sum/",
                    },
                    null,
                    2
                  )
                )
              }
            >
              {copied ? "Copied!" : "Copy"}
            </button>
            <pre>{`{
  "title": "Two Sum",
  "platform": "leetcode",
  "difficulty": "easy",
  "status": "solved",
  "notes": "Used hashmap for O(n) solution",
  "problem_url": "https://leetcode.com/problems/two-sum/"
}`}</pre>
          </div>

          <div className="vs-card-footer">
            <button className="vs-btn vs-btn-outline" onClick={() => setActiveStep(1)}>
              ← Back
            </button>
            <button className="vs-btn vs-btn-primary" onClick={() => setActiveStep(3)}>
              Next: Test the Action →
            </button>
          </div>
        </div>
      )}

      {/* ──────────────── STEP 3: Test ──────────────── */}
      {activeStep === 3 && (
        <div className="vs-card">
          <h2 className="vs-card-title">
            <span className="vs-step-badge">3</span> Test the Action
          </h2>
          <p className="vs-card-desc">
            Fill in the form below to send a test request directly from your browser. A successful
            response confirms your integration is working.
          </p>

          <form onSubmit={handleTestAction} className="vs-test-form">
            <div className="vs-form-row">
              <label className="vs-label" htmlFor="title">
                Problem Title <span className="vs-required">*</span>
              </label>
              <input
                id="title"
                className="vs-input"
                type="text"
                name="title"
                placeholder="e.g. Two Sum"
                value={testForm.title}
                onChange={handleTestFormChange}
                required
              />
            </div>

            <div className="vs-form-grid">
              <div className="vs-form-row">
                <label className="vs-label" htmlFor="platform">Platform</label>
                <select
                  id="platform"
                  className="vs-select"
                  name="platform"
                  value={testForm.platform}
                  onChange={handleTestFormChange}
                >
                  {PLATFORM_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="vs-form-row">
                <label className="vs-label" htmlFor="difficulty">Difficulty</label>
                <select
                  id="difficulty"
                  className="vs-select"
                  name="difficulty"
                  value={testForm.difficulty}
                  onChange={handleTestFormChange}
                >
                  {DIFFICULTY_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="vs-form-row">
                <label className="vs-label" htmlFor="status">Status</label>
                <select
                  id="status"
                  className="vs-select"
                  name="status"
                  value={testForm.status}
                  onChange={handleTestFormChange}
                >
                  {STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="vs-form-row">
                <label className="vs-label" htmlFor="problem_url">Problem URL</label>
                <input
                  id="problem_url"
                  className="vs-input"
                  type="url"
                  name="problem_url"
                  placeholder="https://leetcode.com/problems/..."
                  value={testForm.problem_url}
                  onChange={handleTestFormChange}
                />
              </div>
            </div>

            <div className="vs-form-row">
              <label className="vs-label" htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                className="vs-textarea"
                name="notes"
                rows={3}
                placeholder="Describe your approach, time/space complexity, etc."
                value={testForm.notes}
                onChange={handleTestFormChange}
              />
            </div>

            {testResult && (
              <div className={`vs-alert ${testResult.success ? "vs-alert-success" : "vs-alert-error"}`}>
                <div>{testResult.message}</div>
                {testResult.errors && (
                  <ul className="vs-error-list">
                    {Object.entries(testResult.errors).map(([field, msgs]) => (
                      <li key={field}>
                        <strong>{field}:</strong> {Array.isArray(msgs) ? msgs.join(", ") : msgs}
                      </li>
                    ))}
                  </ul>
                )}
                {testResult.data && (
                  <div className="vs-success-detail">
                    Problem ID <strong>#{testResult.data.id}</strong> logged at{" "}
                    {new Date(testResult.data.created_at).toLocaleString()}.
                  </div>
                )}
              </div>
            )}

            <div className="vs-card-footer">
              <button type="button" className="vs-btn vs-btn-outline" onClick={() => setActiveStep(2)}>
                ← Back
              </button>
              <button type="submit" className="vs-btn vs-btn-primary" disabled={testLoading}>
                {testLoading ? "Sending…" : "Send Test Request ⚡"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quick-reference footer */}
      <div className="vs-quick-ref">
        <h3 className="vs-qr-title">Quick Reference</h3>
        <div className="vs-qr-grid">
          <div className="vs-qr-item">
            <div className="vs-qr-label">Endpoint</div>
            <code className="vs-qr-value">POST /api/viasocket/log-problem/</code>
          </div>
          <div className="vs-qr-item">
            <div className="vs-qr-label">Auth Header</div>
            <code className="vs-qr-value">X-API-Key: &lt;your-key&gt;</code>
          </div>
          <div className="vs-qr-item">
            <div className="vs-qr-label">Required Field</div>
            <code className="vs-qr-value">title (string)</code>
          </div>
          <div className="vs-qr-item">
            <div className="vs-qr-label">Success Response</div>
            <code className="vs-qr-value">201 Created</code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ViaSocketPage;
