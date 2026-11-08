import React, { useRef, useEffect } from 'react';
import { Bell, AlertOctagon, AlertTriangle, Info, CheckCircle2, X } from 'lucide-react';

export default function NotificationDrawer({
  notifications = [],
  open,
  onClose,
  onNavigateTab
}) {
  const drawerRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (drawerRef.current && !drawerRef.current.contains(e.target)) {
        onClose();
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={drawerRef}
      className="absolute right-0 top-12 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
    >
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Operational Alerts ({notifications.length})
          </h3>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 font-bold text-lg cursor-pointer"
        >
          &times;
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/80 my-2">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
            <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
            No active operational warnings. Everything running smoothly!
          </div>
        ) : (
          notifications.map((n) => {
            const isCrit = n.type === 'CRITICAL';
            const isWarn = n.type === 'WARNING';

            return (
              <div
                key={n.id}
                onClick={() => {
                  if (n.link_tab) onNavigateTab(n.link_tab);
                  onClose();
                }}
                className="py-3 px-1.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 rounded-xl transition cursor-pointer group"
              >
                <div className="flex items-start space-x-2.5">
                  <div className="mt-0.5 shrink-0">
                    {isCrit ? (
                      <AlertOctagon className="w-4 h-4 text-rose-500" />
                    ) : isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition">
                        {n.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{n.created_at}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                      {n.message}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
        <span className="text-[10px] text-slate-400 dark:text-slate-500">
          Telemetry synced automatically &bull; Real-time push
        </span>
      </div>
    </div>
  );
}
