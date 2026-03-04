import { useState, useEffect } from "react";
import { Loader, Plus } from "lucide-react";
import PageLayout from "../components/layout/PageLayout.jsx";
import JobForm from "../components/jobs/JobForm.jsx";
import StatusBadge from "../components/ui/StatusBadge.jsx";
import { fetchJobs, updateJob, createJob } from "../api/jobApi.js";
import { JOB_STATUSES, STATUS_COLORS } from "../utils/constants.js";

const KanbanCard = ({ job, onDragStart, onEdit }) => (
  <div
    draggable
    onDragStart={() => onDragStart(job)}
    onClick={() => onEdit(job)}
    className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
  >
    {/* Company Avatar + Name */}
    <div className="flex items-center gap-2 mb-3">
      <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
        {job.company.charAt(0)}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-gray-800 truncate">{job.company}</p>
        <p className="text-xs text-gray-500 truncate">{job.position}</p>
      </div>
    </div>

    {/* Location + Salary */}
    <div className="space-y-1 mb-3">
      {job.location && (
        <p className="text-xs text-gray-400">📍 {job.location}</p>
      )}
      {job.salary && (
        <p className="text-xs text-gray-400">💰 {job.salary}</p>
      )}
    </div>

    {/* Applied Date */}
    <p className="text-xs text-gray-400">
      Applied {new Date(job.appliedDate).toLocaleDateString()}
    </p>
  </div>
);

const KanbanColumn = ({ status, jobs, onDragStart, onDragOver, onDrop, onEdit, onAddJob }) => {
  const colors = STATUS_COLORS[status];

  return (
    <div
      className="flex-1 min-w-64 bg-gray-50 rounded-xl border border-gray-200 flex flex-col"
      onDragOver={(e) => { e.preventDefault(); onDragOver(status); }}
      onDrop={() => onDrop(status)}
    >
      {/* Column Header */}
      <div className={`flex items-center justify-between px-4 py-3 border-b border-gray-200 rounded-t-xl ${colors.bg}`}>
        <div className="flex items-center gap-2">
          <span className={`text-sm font-semibold ${colors.text}`}>{status}</span>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors.bg} ${colors.text} ${colors.border}`}>
            {jobs.length}
          </span>
        </div>
        <button
          onClick={() => onAddJob(status)}
          className={`${colors.text} hover:opacity-70 transition-opacity`}
        >
          <Plus size={16} />
        </button>
      </div>

      {/* Cards */}
      <div className="flex-1 p-3 space-y-3 min-h-32 overflow-y-auto max-h-[calc(100vh-220px)]">
        {jobs.length === 0 ? (
          <div className="flex items-center justify-center h-24 border-2 border-dashed border-gray-200 rounded-xl">
            <p className="text-xs text-gray-400">Drop jobs here</p>
          </div>
        ) : (
          jobs.map((job) => (
            <KanbanCard
              key={job._id}
              job={job}
              onDragStart={onDragStart}
              onEdit={onEdit}
            />
          ))
        )}
      </div>
    </div>
  );
};

const KanbanBoard = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggedJob, setDraggedJob] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editJob, setEditJob] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState("Applied");

  const loadJobs = async () => {
    try {
      const { data } = await fetchJobs();
      setJobs(data.data);
    } catch (err) {
      console.error("Failed to load jobs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadJobs(); }, []);

  // Group jobs by status
  const grouped = JOB_STATUSES.reduce((acc, status) => {
    acc[status] = jobs.filter((job) => job.status === status);
    return acc;
  }, {});

  const handleDragStart = (job) => setDraggedJob(job);

  const handleDragOver = (status) => setDragOverStatus(status);

  const handleDrop = async (newStatus) => {
    if (!draggedJob || draggedJob.status === newStatus) {
      setDraggedJob(null);
      return;
    }
    try {
      // Optimistic update — update UI immediately before API call
      setJobs((prev) =>
        prev.map((j) => j._id === draggedJob._id ? { ...j, status: newStatus } : j)
      );
      await updateJob(draggedJob._id, { status: newStatus });
    } catch (err) {
      console.error("Failed to update status:", err);
      loadJobs(); // Revert on error
    } finally {
      setDraggedJob(null);
      setDragOverStatus(null);
    }
  };

  const handleAddJob = (status) => {
    setDefaultStatus(status);
    setShowForm(true);
  };

  const handleCreate = async (form) => {
    try {
      await createJob(form);
      setShowForm(false);
      loadJobs();
    } catch (err) {
      console.error("Failed to create job:", err);
    }
  };

  const handleUpdate = async (form) => {
    try {
      await updateJob(editJob._id, form);
      setEditJob(null);
      loadJobs();
    } catch (err) {
      console.error("Failed to update job:", err);
    }
  };

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
          <h1 className="text-2xl font-bold text-gray-800">Kanban Board</h1>
          <p className="text-gray-500 text-sm mt-1">
            Drag and drop to update application status
          </p>
        </div>
        <button
          onClick={() => { setDefaultStatus("Applied"); setShowForm(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Job
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {JOB_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            jobs={grouped[status]}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            onEdit={setEditJob}
            onAddJob={handleAddJob}
          />
        ))}
      </div>

      {/* Modals */}
      {showForm && (
        <JobForm
          onSubmit={handleCreate}
          onClose={() => setShowForm(false)}
          initialData={{ status: defaultStatus }}
        />
      )}
      {editJob && (
        <JobForm
          onSubmit={handleUpdate}
          onClose={() => setEditJob(null)}
          initialData={editJob}
        />
      )}
    </PageLayout>
  );
};

export default KanbanBoard;