import type { Account } from '../../types/account';
import { Trash2, Power } from 'lucide-react';
import { cn } from '../../utils/cn';

interface AccountCardProps {
  account: Account;
  onDelete: (id: string) => void;
  onToggleDisabled: (id: string, disabled: boolean) => void;
}

export default function AccountCard({
  account,
  onDelete,
  onToggleDisabled,
}: AccountCardProps) {
  const isDisabled = account.disabled || account.proxy_disabled;
  const quotaPercent = account.quota
    ? (account.quota.usage / account.quota.limit) * 100
    : 0;

  return (
    <div className={cn(
      'card bg-base-100 shadow-xl',
      isDisabled && 'opacity-50'
    )}>
      <div className="card-body">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="card-title text-lg">
              {account.email}
            </h3>
            <div className="text-sm text-base-content/70 mt-1">
              <div className="flex items-center gap-2">
                <span className="badge badge-ghost">
                  {account.quota?.type || '未知'}
                </span>
                {isDisabled && (
                  <span className="badge badge-error">已禁用</span>
                )}
              </div>
            </div>
          </div>
          <div className="dropdown dropdown-end">
            <button
              tabIndex={0}
              className="btn btn-ghost btn-sm btn-circle"
            >
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
                  d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                />
              </svg>
            </button>
            <ul
              tabIndex={0}
              className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-100 rounded-box w-32"
            >
              <li>
                <button
                  onClick={() => onToggleDisabled(account.id, !account.disabled)}
                  className="flex items-center gap-2"
                >
                  <Power className="w-4 h-4" />
                  {isDisabled ? '启用' : '禁用'}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onDelete(account.id)}
                  className="flex items-center gap-2 text-error"
                >
                  <Trash2 className="w-4 h-4" />
                  删除
                </button>
              </li>
            </ul>
          </div>
        </div>

        {account.quota && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>配额使用</span>
              <span>
                {account.quota.usage} / {account.quota.limit}
              </span>
            </div>
            <progress
              className="progress progress-primary w-full"
              value={account.quota.usage}
              max={account.quota.limit}
            ></progress>
            <div className="text-xs text-base-content/60 mt-1">
              已使用 {quotaPercent.toFixed(1)}%
            </div>
          </div>
        )}

        {!account.quota && (
          <div className="alert alert-info mt-4">
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
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm">配额信息未知</span>
          </div>
        )}
      </div>
    </div>
  );
}
