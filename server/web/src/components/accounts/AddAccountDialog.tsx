import { useState } from 'react';
import { X } from 'lucide-react';

interface AddAccountDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (email: string, refreshToken: string) => Promise<void>;
}

export default function AddAccountDialog({
  open,
  onClose,
  onAdd,
}: AddAccountDialogProps) {
  const [email, setEmail] = useState('');
  const [refreshToken, setRefreshToken] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !refreshToken.trim()) return;

    try {
      await onAdd(email, refreshToken);
      setEmail('');
      setRefreshToken('');
      onClose();
    } catch (error) {
      // Error handled by parent
    }
  };

  if (!open) return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-lg">添加账号</h3>
          <button
            onClick={onClose}
            className="btn btn-sm btn-circle btn-ghost"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">邮箱</span>
            </label>
            <input
              type="email"
              placeholder="user@example.com"
              className="input input-bordered w-full"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-control mt-4">
            <label className="label">
              <span className="label-text">刷新令牌 (Refresh Token)</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              placeholder="粘贴刷新令牌..."
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              required
            ></textarea>
            <label className="label">
              <span className="label-text-alt">
                如何获取刷新令牌？查看帮助文档
              </span>
            </label>
          </div>

          <div className="modal-action">
            <button
              type="button"
              onClick={onClose}
              className="btn"
            >
              取消
            </button>
            <button type="submit" className="btn btn-primary">
              添加
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-backdrop">
        <button onClick={onClose}>close</button>
      </form>
    </dialog>
  );
}
