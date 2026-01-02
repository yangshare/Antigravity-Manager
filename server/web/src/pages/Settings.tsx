export default function Settings() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">设置</h1>

      <div className="card bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title mb-4">系统设置</h2>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">深色模式</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </label>
          </div>

          <div className="form-control">
            <label className="label cursor-pointer">
              <span className="label-text">自动刷新配额</span>
              <input type="checkbox" className="toggle toggle-primary" />
            </label>
          </div>

          <div className="divider"></div>

          <div className="alert alert-info">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              className="w-6 h-6 stroke-current shrink-0"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span>
              更多设置即将推出...
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
