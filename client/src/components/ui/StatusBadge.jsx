import { STATUS_COLORS } from "../../utils/constants.js";

const StatusBadge = ({ status }) => {
  const colors = STATUS_COLORS[status] || {};
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors.bg} ${colors.text} ${colors.border}`}>
      {status}
    </span>
  );
};

export default StatusBadge;