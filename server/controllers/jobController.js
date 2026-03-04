import Job from "../models/Job.js";

export const getJobs = async (req, res, next) => {
  try {
    const jobs = await Job.find({ user: req.user._id }).sort({ createdAt: -1 }).lean();
    res.status(200).json({ success: true, count: jobs.length, data: jobs });
  } catch (error) { next(error); }
};

export const getJobById = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id).lean();
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });
    res.status(200).json({ success: true, data: job });
  } catch (error) { next(error); }
};

export const createJob = async (req, res, next) => {
  try {
    const job = await Job.create({ user: req.user._id, ...req.body });
    res.status(201).json({ success: true, data: job });
  } catch (error) { next(error); }
};

export const updateJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: updated });
  } catch (error) { next(error); }
};

export const deleteJob = async (req, res, next) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ success: false, message: "Job not found" });
    if (job.user.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Not authorized" });
    await job.deleteOne();
    res.status(200).json({ success: true, message: "Job deleted" });
  } catch (error) { next(error); }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const statusCounts = await Job.aggregate([
      { $match: { user: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const total = await Job.countDocuments({ user: userId });
    const stats = { Applied: 0, Interview: 0, Offer: 0, Rejected: 0 };
    statusCounts.forEach(({ _id, count }) => { stats[_id] = count; });
    const responseRate = total > 0
      ? Math.round(((stats.Interview + stats.Offer) / total) * 100) : 0;
    res.status(200).json({ success: true, data: { total, stats, responseRate } });
  } catch (error) { next(error); }
};