import { useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { useAccountStore } from '../stores/useAccountStore';
import { showToast } from '../components/common/ToastContainer';
import AccountCard from '../components/accounts/AccountCard';
import AddAccountDialog from '../components/accounts/AddAccountDialog';

export default function Accounts() {
  const {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    deleteAccount,
    refreshQuotas,
  } = useAccountStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // TODO: 使用 processingId 显示加载状态
  void processingId;

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleAddAccount = async (email: string, refreshToken: string) => {
    try {
      await addAccount(email, refreshToken);
      showToast('success', '账号添加成功');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '添加账号失败');
      throw error;
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!confirm('确定要删除这个账号吗？')) return;

    setProcessingId(id);
    try {
      await deleteAccount(id);
      showToast('success', '账号删除成功');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '删除账号失败');
    } finally {
      setProcessingId(null);
    }
  };

  const handleToggleDisabled = async (id: string, disabled: boolean) => {
    setProcessingId(id);
    try {
      await fetchAccounts(); // Re-fetch to get updated state
      showToast('success', disabled ? '账号已禁用' : '账号已启用');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '操作失败');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRefreshAll = async () => {
    try {
      await refreshQuotas();
      showToast('success', '配额刷新成功');
    } catch (error) {
      showToast('error', error instanceof Error ? error.message : '刷新配额失败');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">账号管理</h1>
          <p className="text-base-content/70 mt-1">
            管理您的 API 账号，查看配额使用情况
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleRefreshAll}
            disabled={loading}
            className="btn btn-ghost"
          >
            <RefreshCw className={loading ? 'animate-spin' : ''} />
            刷新配额
          </button>
          <button
            onClick={() => setDialogOpen(true)}
            className="btn btn-primary"
          >
            <Plus />
            添加账号
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-error mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-5 h-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <div className="stats stats-vertical lg:stats-horizontal shadow w-full mb-6">
        <div className="stat">
          <div className="stat-title">总账号数</div>
          <div className="stat-value text-primary">{accounts.length}</div>
        </div>
        <div className="stat">
          <div className="stat-title">可用账号</div>
          <div className="stat-value text-success">
            {accounts.filter((a) => !a.disabled && !a.proxy_disabled).length}
          </div>
        </div>
        <div className="stat">
          <div className="stat-title">已禁用</div>
          <div className="stat-value text-error">
            {accounts.filter((a) => a.disabled || a.proxy_disabled).length}
          </div>
        </div>
      </div>

      {accounts.length === 0 && !loading ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">暂无账号</h3>
          <p className="text-base-content/70 mb-4">
            点击"添加账号"按钮开始添加您的第一个账号
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {accounts.map((account) => (
            <AccountCard
              key={account.id}
              account={account}
              onDelete={handleDeleteAccount}
              onToggleDisabled={handleToggleDisabled}
            />
          ))}
        </div>
      )}

      <AddAccountDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onAdd={handleAddAccount}
      />
    </div>
  );
}
