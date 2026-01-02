import { useEffect, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { useSystemStore } from '../stores/useSystemStore';
import { showToast } from '../components/common/ToastContainer';

export default function Proxy() {
  const { proxyStatus, loading, fetchProxyStatus, startProxy, stopProxy } =
    useSystemStore();

  const [port, setPort] = useState(8046);

  useEffect(() => {
    fetchProxyStatus();
  }, [fetchProxyStatus]);

  const handleStart = async () => {
    try {
      await startProxy(port);
      showToast('success', '代理已启动');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '启动失败');
    }
  };

  const handleStop = async () => {
    try {
      await stopProxy();
      showToast('success', '代理已停止');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '停止失败');
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">API 代理</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">代理状态</h2>

            <div className="stats stats-vertical bg-base-200 w-full mt-4">
              <div className="stat">
                <div className="stat-title">运行状态</div>
                <div className="stat-value text-2xl">
                  {proxyStatus?.running ? (
                    <span className="text-success">运行中</span>
                  ) : (
                    <span className="text-error">已停止</span>
                  )}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">监听端口</div>
                <div className="stat-value text-2xl">
                  {proxyStatus?.port || '-'}
                </div>
              </div>
              <div className="stat">
                <div className="stat-title">可用账号</div>
                <div className="stat-value text-2xl text-primary">
                  {proxyStatus?.availableAccounts || 0}
                </div>
              </div>
            </div>

            <div className="card-actions justify-end mt-4">
              <button
                onClick={handleStop}
                disabled={!proxyStatus?.running || loading}
                className="btn btn-error"
              >
                <Square />
                停止
              </button>
              <button
                onClick={handleStart}
                disabled={proxyStatus?.running || loading}
                className="btn btn-success"
              >
                <Play />
                启动
              </button>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">代理配置</h2>

            <div className="form-control">
              <label className="label">
                <span className="label-text">监听端口</span>
              </label>
              <input
                type="number"
                className="input input-bordered"
                value={port}
                onChange={(e) => setPort(Number(e.target.value))}
                disabled={proxyStatus?.running}
              />
              <label className="label">
                <span className="label-text-alt">
                  代理服务将监听此端口
                </span>
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
                启动代理后，可以使用 OpenAI 兼容的 API 格式调用服务
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="card bg-base-100 shadow-xl mt-6">
        <div className="card-body">
          <h2 className="card-title mb-4">API 使用示例</h2>

          <div className="mockup-code">
            <pre data-prefix="$">
              <code>curl -X POST http://localhost:{port}/v1/chat/completions \</code>
            </pre>
            <pre data-prefix=" ">
              <code>  -H "Content-Type: application/json" \</code>
            </pre>
            <pre data-prefix=" ">
              <code>{"  -d '{\"model\": \"gemini-2.0-flash-exp\", \"messages\": [{\"role\": \"user\", \"content\": \"你好\"}]}'"}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
