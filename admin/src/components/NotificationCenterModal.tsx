import { useState, useEffect, useCallback } from "react";
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Clock,
  AlertTriangle,
  Flame,
  FileText,
  Wrench,
  ShoppingBag,
  Loader2,
  RefreshCw,
  Zap,
} from "lucide-react";
import { adminNotificationService, AdminNotificationItem } from "@/services/adminNotificationService";

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNotificationRead?: () => void;
}

export default function NotificationCenterModal({
  isOpen,
  onClose,
  onNotificationRead,
}: NotificationCenterModalProps) {
  const [notifications, setNotifications] = useState<AdminNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterUnreadOnly, setFilterUnreadOnly] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await adminNotificationService.getNotifications({
        isRead: filterUnreadOnly ? false : undefined,
      });
      setNotifications(res.data || []);
    } catch (err) {
      console.error("Failed to load notifications", err);
    } finally {
      setLoading(false);
    }
  }, [filterUnreadOnly]);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen, fetchNotifications]);

  if (!isOpen) return null;

  async function handleMarkRead(id: string) {
    try {
      await adminNotificationService.markRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  }

  async function handleMarkAllRead() {
    try {
      await adminNotificationService.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  }

  async function handleDelete(id: string) {
    try {
      await adminNotificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n._id !== id));
      if (onNotificationRead) onNotificationRead();
    } catch (err) {
      console.error("Failed to delete notification", err);
    }
  }

  async function handleTriggerScan() {
    setIsScanning(true);
    setScanMessage(null);
    try {
      const res = await adminNotificationService.triggerReminderScan();
      setScanMessage(res.message || "Reminder scan completed successfully");
      fetchNotifications();
      setTimeout(() => setScanMessage(null), 4000);
    } catch (err) {
      console.error("Failed to trigger scan", err);
      setScanMessage("Scan failed or completed with errors");
    } finally {
      setIsScanning(false);
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "refill_reminder":
        return <Flame className="w-4 h-4 text-orange-500" />;
      case "amc_renewal":
        return <FileText className="w-4 h-4 text-blue-500" />;
      case "service_update":
        return <Wrench className="w-4 h-4 text-amber-500" />;
      case "order":
        return <ShoppingBag className="w-4 h-4 text-green-500" />;
      default:
        return <AlertTriangle className="w-4 h-4 text-brand" />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl border-l border-black/10">
        {/* Header */}
        <div className="p-4 border-b border-black/10 flex items-center justify-between bg-paper/60">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-brand" />
            <h2 className="font-display font-bold text-base text-ink">Admin Notification Center</h2>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-brand text-white rounded-full text-[10px] font-bold font-mono">
                {unreadCount} unread
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-steel hover:text-ink hover:bg-black/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Controls & Automated Scan Trigger */}
        <div className="p-3 border-b border-black/10 bg-paper/30 flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFilterUnreadOnly(!filterUnreadOnly)}
              className={`px-2.5 py-1 rounded font-semibold border transition-colors ${
                filterUnreadOnly
                  ? "bg-brand text-white border-brand"
                  : "bg-white text-steel border-black/10 hover:text-ink"
              }`}
            >
              {filterUnreadOnly ? "Showing Unread" : "All Alerts"}
            </button>
            <button
              onClick={handleMarkAllRead}
              className="px-2.5 py-1 bg-white hover:bg-gray-100 border border-black/10 rounded font-semibold text-ink flex items-center gap-1"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark All Read
            </button>
          </div>

          <button
            onClick={handleTriggerScan}
            disabled={isScanning}
            className="px-2.5 py-1 bg-brand/10 hover:bg-brand hover:text-white border border-brand/20 text-brand rounded font-bold flex items-center gap-1 transition-colors"
            title="Trigger Automated Daily Equipment & AMC Expiry Cron Scan"
          >
            <Zap className={`w-3.5 h-3.5 ${isScanning ? "animate-spin" : ""}`} />
            Scan Expiries
          </button>
        </div>

        {scanMessage && (
          <div className="p-2 bg-green-50 text-green-800 border-b border-green-200 text-xs text-center font-semibold">
            {scanMessage}
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto divide-y divide-black/5">
          {loading ? (
            <div className="p-12 flex flex-col items-center justify-center text-steel gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-brand" />
              <span className="text-xs">Loading notifications...</span>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center text-steel text-xs">
              No notifications at this time. All equipment and AMC records are healthy.
            </div>
          ) : (
            notifications.map((item) => (
              <div
                key={item._id}
                className={`p-4 transition-colors flex gap-3 ${
                  item.isRead ? "bg-white" : "bg-brand/5 font-medium"
                }`}
              >
                <div className="mt-0.5 shrink-0 p-1.5 rounded-full bg-paper border border-black/5">
                  {getTypeIcon(item.type)}
                </div>
                <div className="flex-1 min-w-0 text-xs space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-ink truncate">{item.title}</h4>
                    <span className="text-[10px] text-steel shrink-0 whitespace-nowrap">
                      {new Date(item.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                  <p className="text-steel leading-relaxed">{item.message}</p>
                  {item.userId?.name && (
                    <span className="text-[10px] text-steel font-semibold block">
                      Target Client: {item.userId.name} ({item.userId.email})
                    </span>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] font-mono text-steel uppercase">
                      {item.type.replace("_", " ")}
                    </span>
                    <div className="flex items-center gap-2">
                      {!item.isRead && (
                        <button
                          onClick={() => handleMarkRead(item._id)}
                          className="text-[11px] text-brand hover:underline font-bold"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="text-steel hover:text-red-600 p-0.5"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
