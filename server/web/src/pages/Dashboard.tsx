import { useEffect } from 'react';
import { useAccountStore } from '../stores/useAccountStore';
import { useSystemStore } from '../stores/useSystemStore';
import { Users, Activity, HardDrive, Zap } from 'lucide-react';

export default function Dashboard() {
  const { accounts, fetchAccounts } = useAccountStore();
  const { systemInfo, proxyStatus, fetchSystemInfo, fetchProxyStatus } = useSystemStore();

  useEffect(() => {
    fetchAccounts();
    fetchSystemInfo();
    fetchProxyStatus();
  }, [fetchAccounts, fetchSystemInfo, fetchProxyStatus]);

  const availableAccounts = accounts.filter((a) => !a.disabled && !a.proxy_disabled);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">仪表盘</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-primary">
            <Users className="w-8 h-8" />
          </div>
          <div className="stat-title">总账号数</div>
          <div className="stat-value text-primary">{accounts.length}</div>
          <div className="stat-desc">
            可用: {availableAccounts.length}
          </div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-secondary">
            <Activity className="w-8 h-8" />
          </div>
          <div className="stat-title">代理状态</div>
          <div className="stat-value text-secondary">
            {proxyStatus?.running ? '运行中' : '已停止'}
          </div>
          <div className="stat-desc">
            端口: {proxyStatus?.port || '-'}
          </div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-accent">
            <HardDrive className="w-8 h-8" />
          </div>
          <div className="stat-title">系统版本</div>
          <div className="stat-value text-accent text-2xl">
            {systemInfo?.version || '-'}
          </div>
          <div className="stat-desc">
            环境: {systemInfo?.environment || '-'}
          </div>
        </div>

        <div className="stat bg-base-100 shadow-xl rounded-box">
          <div className="stat-figure text-info">
            <Zap className="w-8 h-8" />
          </div>
          <div className="stat-title">运行时间</div>
          <div className="stat-value text-info text-2xl">
            {systemInfo?.uptime
              ? `${Math.floor(systemInfo.uptime / 3600)}h`
              : '-'}
          </div>
          <div className="stat-desc">服务器运行时间</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">最近账号</h2>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>邮箱</th>
                    <th>类型</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {accounts.slice(0, 5).map((account) => {
                    const isDisabled = account.disabled || account.proxy_disabled;
                    return (
                      <tr key={account.id}>
                        <td>{account.email}</td>
                        <td>
                          <span className="badge badge-ghost">
                            {account.quota?.type || '未知'}
                          </span>
                        </td>
                        <td>
                          {isDisabled ? (
                            <span className="badge badge-error">已禁用</span>
                          ) : (
                            <span className="badge badge-success">可用</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {accounts.length === 0 && (
                    <tr>
                      <td colSpan={3} className="text-center">
                        暂无账号
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title">配额概览</h2>
            {accounts.length === 0 ? (
              <div className="text-center py-8 text-base-content/60">
                添加账号后查看配额信息
              </div>
            ) : (
              <div className="space-y-4">
                {accounts
                  .filter((a) => a.quota)
                  .slice(0, 5)
                  .map((account) => {
                    return (
                      <div key={account.id}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="truncate w-32">
                            {account.email}
                          </span>
                          <span>
                            {account.quota!.usage} / {account.quota!.limit}
                          </span>
                        </div>
                        <progress
                          className="progress progress-primary w-full"
                          value={account.quota!.usage}
                          max={account.quota!.limit}
                        ></progress>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
