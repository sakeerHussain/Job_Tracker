import { useState, useEffect } from "react";
import { FileText, Loader, Copy, Check, Sparkles, ChevronDown } from "lucide-react";
import PageLayout from "../components/layout/PageLayout.jsx";
import { generateCoverLetter } from "../api/aiApi.js";
import { fetchJobs } from "../api/jobApi.js";

const CoverLetter = () => {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState("");
  const [form, setForm] = useState({
    company: "",
    position: "",
    jobDescription: "",
    userBackground: "",
  });
  const [coverLetter, setCoverLetter] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  // Load jobs to prefill form from existing applications
  useEffect(() => {
    const loadJobs = async () => {
      try {
        const { data } = await fetchJobs();
        setJobs(data.data);
      } catch (err) {
        console.error("Failed to load jobs:", err);
      }
    };
    loadJobs();
  }, []);

  // When user selects a job — prefill company, position, description
  const handleJobSelect = (e) => {
    const jobId = e.target.value;
    setSelectedJob(jobId);
    if (!jobId) {
      setForm({ company: "", position: "", jobDescription: "", userBackground: form.userBackground });
      return;
    }
    const job = jobs.find((j) => j._id === jobId);
    if (job) {
      setForm((prev) => ({
        ...prev,
        company: job.company,
        position: job.position,
        jobDescription: job.description || "",
      }));
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleGenerate = async () => {
    if (!form.company || !form.position || !form.jobDescription) {
      setError("Company, position, and job description are required.");
      return;
    }
    setLoading(true);
    setError("");
    setCoverLetter("");
    try {
      const { data } = await generateCoverLetter(form);
      setCoverLetter(data.data.coverLetter);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to generate. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">AI Cover Letter</h1>
        <p className="text-gray-500 text-sm mt-1">
          Generate a tailored cover letter using AI in seconds
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Left Panel: Input Form ── */}
        <div className="space-y-5">

          {/* Prefill from existing job */}
          {jobs.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="text-sm font-medium text-blue-700 mb-2">
                ⚡ Prefill from existing application
              </p>
              <div className="relative">
                <select
                  value={selectedJob}
                  onChange={handleJobSelect}
                  className="w-full px-3 py-2.5 pr-8 border border-blue-200 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                >
                  <option value="">Select a job application...</option>
                  {jobs.map((job) => (
                    <option key={job._id} value={job._id}>
                      {job.company} — {job.position}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  size={16}
                />
              </div>
            </div>
          )}

          {/* Company */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Company <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              placeholder="Google"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Position */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Position <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="position"
              value={form.position}
              onChange={handleChange}
              placeholder="Frontend Developer"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Job Description */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Job Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="jobDescription"
              value={form.jobDescription}
              onChange={handleChange}
              rows={5}
              placeholder="Paste the full job description here..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Your Background */}
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Your Background
              <span className="text-gray-400 font-normal ml-1">(optional but recommended)</span>
            </label>
            <textarea
              name="userBackground"
              value={form.userBackground}
              onChange={handleChange}
              rows={4}
              placeholder="e.g. MERN stack developer with 1 year experience, built 3 portfolio projects, strong in React and Node.js..."
              className="w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 rounded-lg transition-colors text-sm"
          >
            {loading ? (
              <>
                <Loader size={16} className="animate-spin" />
                Generating with AI...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generate Cover Letter
              </>
            )}
          </button>
        </div>

        {/* ── Right Panel: Output ── */}
        <div className="bg-white rounded-xl border border-gray-200 flex flex-col">

          {/* Output Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-gray-400" />
              <span className="text-sm font-semibold text-gray-700">Generated Cover Letter</span>
            </div>
            {coverLetter && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-gray-600"
              >
                {copied ? (
                  <><Check size={13} className="text-green-500" /> Copied!</>
                ) : (
                  <><Copy size={13} /> Copy</>
                )}
              </button>
            )}
          </div>

          {/* Output Body */}
          <div className="flex-1 p-5">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-64 gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-blue-100 border-t-blue-600 animate-spin" />
                </div>
                <p className="text-sm text-gray-500">AI is writing your cover letter...</p>
                <p className="text-xs text-gray-400">This usually takes 5-10 seconds</p>
              </div>
            ) : coverLetter ? (
              <div className="prose prose-sm max-w-none">
                <pre className="whitespace-pre-wrap text-sm text-gray-700 font-sans leading-relaxed">
                  {coverLetter}
                </pre>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                  <Sparkles className="text-blue-400" size={28} />
                </div>
                <p className="text-gray-500 font-medium">Your cover letter will appear here</p>
                <p className="text-gray-400 text-xs mt-1 max-w-xs">
                  Fill in the details on the left and click Generate
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

export default CoverLetter;

