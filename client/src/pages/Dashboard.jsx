import { useState, useEffect } from "react";
import { Plus, Search, Briefcase, Loader, Trash2, ExternalLink } from "lucide-react";
import PageLayout from "../components/layout/PageLayout.jsx";
import JobForm from "../components/jobs/JobForm.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { fetchJobs, createJob, updateJob, deleteJob, fetchAnalytics } from "../api/jobApi.js";
import { STATUS_COLORS } from "../utils/constants.js";

const StatCard = ({ label, value, color }) => (
  <div className={`bg-white rounded-xl border p-5 ${color}`}>
    <p className="text-sm text-gray-500 mb-1">{label}</p>
    <p className="text-3xl font-bold text-gray-800">{value}</p>
  </div>
);

const Dashboard = () => {
  const [jobs, setJobs] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);

  const loadData = async () => {
    try {
      const [jobsRes, analyticsRes] = await Promise.all([
        fetchJobs(),
        fetchAnalytics(),
      ]);
      setJobs(jobsRes.data.data);
      setAnalytics(analyticsRes.data.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, []);

  const handleCreate = async (form) => {
    try {
      await createJob(form);
      setShowForm(false);
      loadData();
    } catch (err) {
      console.error("Failed to create job:", err);
    }
  };

  const handleUpdate = async (form) => {
    try {
      await updateJob(editJob._id, form);
      setEditJob(null);
      loadData();
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this job?")) return;
    try {
      await deleteJob(id);
      loadData();
    } catch (err) {
      console.error("Failed to delete job:", err);
    }
  };

  const filtered = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.position.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center h-64">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-1">Track all your job applications</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Job
        </button>
      </div>

      {/* Stat Cards */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Applied" value={analytics.total} color="border-gray-200" />
          <StatCard label="Interviews" value={analytics.stats.Interview} color="border-yellow-200" />
          <StatCard label="Offers" value={analytics.stats.Offer} color="border-green-200" />
          <StatCard label="Response Rate" value={`${analytics.responseRate}%`} color="border-blue-200" />
        </div>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search company or position..."
            className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {["All", "Applied", "Interview", "Offer", "Rejected"].map((s) => (
            <option key={s}>{s}</option>
          ))}
        </select>
      </div>

      {/* Job List */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <Briefcase className="mx-auto text-gray-300 mb-3" size={48} />
          <p className="text-gray-500 font-medium">No jobs found</p>
          <p className="text-gray-400 text-sm mt-1">Add your first job application to get started</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["Company", "Position", "Status", "Location", "Applied Date", "Actions"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((job) => (
                <tr key={job._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm">
                        {job.company.charAt(0)}
                      </div>
                      <span className="text-sm font-medium text-gray-800">{job.company}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{job.position}</td>
                  <td className="px-4 py-3"><StatusBadge status={job.status} /></td>
                  <td className="px-4 py-3 text-sm text-gray-500">{job.location || "—"}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(job.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {job.jobUrl && (
                        <a href={job.jobUrl} target="_blank" rel="noreferrer"
                          className="text-gray-400 hover:text-blue-600 transition-colors">
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <button onClick={() => setEditJob(job)}
                        className="text-xs text-blue-600 hover:underline font-medium">
                        Edit
                      </button>
                      <button onClick={() => handleDelete(job._id)}
                        className="text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {showForm && <JobForm onSubmit={handleCreate} onClose={() => setShowForm(false)} />}
      {editJob && <JobForm onSubmit={handleUpdate} onClose={() => setEditJob(null)} initialData={editJob} />}
    </PageLayout>
  );
};

export default Dashboard;