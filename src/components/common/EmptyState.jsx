const EmptyState = ({ message, actionLabel, onAction }) => (
  <div className="text-center py-12 bg-base-100 rounded-2xl border border-dashed border-base-300">
    <div className="text-primary text-3xl mb-2" aria-hidden="true">-</div>
    <p className="text-gray-500 text-sm">{message}</p>
    {actionLabel && <button type="button" onClick={onAction} className="btn btn-primary btn-sm mt-4 text-white">{actionLabel}</button>}
  </div>
);

export default EmptyState;
