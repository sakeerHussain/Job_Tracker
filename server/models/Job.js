import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    position: {
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["Applied", "Interview", "Offer", "Rejected"],
      default: "Applied",
    },
    jobUrl:      { type: String, default: "" },
    location:    { type: String, default: "" },
    salary:      { type: String, default: "" },
    description: { type: String, default: "", maxlength: 5000 },
    notes:       { type: String, default: "", maxlength: 2000 },
    appliedDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema);
export default Job;