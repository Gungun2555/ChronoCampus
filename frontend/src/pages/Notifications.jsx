import { useEffect, useState } from "react";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Bell,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Info,
  Check,
} from "lucide-react";
import { Layout } from "@/components/Layout";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState(null);
  const { canWrite } = useAuth();
  const { roleTheme } = useTheme();

  const [formData, setFormData] = useState({
    title: "",
    message: "",
    type: "info",
    priority: "low",
  });

  const resetForm = () => {
    setFormData({ title: "", message: "", type: "info", priority: "low" });
  };

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5000/api/notifications");
      setNotifications(
        Array.isArray(res.data)
          ? res.data.sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
            )
          : [],
      );
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleSubmitNotification = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await axios.post("http://localhost:5000/api/notifications", formData);
      resetForm();
      setShowForm(false);
      fetchNotifications();
    } catch (error) {
      console.error("Error creating notification:", error);
    } finally {
      setFormLoading(false);
    }
  };

  const confirmDeleteNotification = async () => {
    if (!notificationToDelete) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/notifications/${notificationToDelete._id}`,
      );
      setNotifications((prev) =>
        prev.filter((n) => n._id !== notificationToDelete._id),
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    } finally {
      setNotificationToDelete(null);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)),
      );
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
    try {
      await Promise.all(
        unreadIds.map((id) =>
          axios.put(`http://localhost:5000/api/notifications/${id}/read`),
        ),
      );
      fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "success":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead)
      return "bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700";
    switch (type) {
      case "error":
        return "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50 border-l-4 border-l-red-500";
      case "warning":
        return "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700/50 border-l-4 border-l-amber-500";
      case "success":
        return "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700/50 border-l-4 border-l-emerald-500";
      default:
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700/50 border-l-4 border-l-blue-500";
    }
  };

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "high":
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700/50";
      case "medium":
        return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700/50";
      default:
        return "bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600";
    }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Notifications</h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage system-wide alerts and messages.
            </p>
          </div>
          {canWrite() && (
          <Button
            onClick={() => setShowForm(!showForm)}
            className="text-white shadow-sm h-9 px-4 text-sm border-0"
            style={{ backgroundColor: roleTheme?.primary }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Notification
          </Button>
          )}
        </div>

        {/* Form */}
        {showForm && (
          <Card className="bg-white dark:bg-slate-900 border-violet-100 dark:border-slate-700 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
              <CardTitle className="text-slate-900 dark:text-white text-base">
                Create New Notification
              </CardTitle>
              <CardDescription className="text-slate-500">
                This will be broadcasted to users.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <form onSubmit={handleSubmitNotification} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 dark:text-slate-300 font-medium">
                      Type
                    </Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="success">Success</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-slate-700 font-medium">
                      Priority
                    </Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200">
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    Title
                  </Label>
                  <Input
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-violet-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-slate-700 dark:text-slate-300 font-medium">
                    Message
                  </Label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                    required
                    className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:border-violet-400 resize-none"
                    rows={3}
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button
                    type="submit"
                    disabled={formLoading}
                    className="text-white border-0"
                    style={{ backgroundColor: roleTheme?.primary }}
                  >
                    {formLoading ? "Sending..." : "Send Notification"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Notification Feed */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 shadow-sm">
          <CardHeader className="border-b border-slate-100 dark:border-slate-700 pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg" style={{ backgroundColor: roleTheme?.primaryMid }}>
                  <Bell className="h-4 w-4" style={{ color: roleTheme?.primary }} />
                </div>
                <div>
                  <CardTitle className="text-slate-900 dark:text-white text-base">
                    Notification Feed
                  </CardTitle>
                  <CardDescription className="text-slate-500 dark:text-slate-400">
                    {notifications.length} total · {unreadCount} unread
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAllRead}
                disabled={unreadCount === 0}
                className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs h-8"
              >
                Mark All as Read
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {loading ? (
              <p className="text-center text-slate-400 py-10">
                Loading notifications...
              </p>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10">
                <Bell className="mx-auto h-10 w-10 text-slate-300" />
                <h3 className="mt-2 text-sm font-medium text-slate-600">
                  All caught up!
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  There are no new notifications.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 rounded-lg border flex items-start justify-between gap-4 transition-all duration-200 ${getNotificationColor(n.type, n.isRead)}`}
                  >
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-0.5 flex-shrink-0">
                        {getNotificationIcon(n.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p
                            className={`font-semibold text-sm ${n.isRead ? "text-slate-500 dark:text-slate-400" : "text-slate-800 dark:text-slate-100"}`}
                          >
                            {n.title}
                          </p>
                          <Badge
                            variant="outline"
                            className={`${getPriorityBadgeClass(n.priority)} capitalize text-xs`}
                          >
                            {n.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          {n.message}
                        </p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1.5">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {!n.isRead && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50"
                          onClick={() => handleMarkAsRead(n._id)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      {canWrite() && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 w-8 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setNotificationToDelete(n)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Delete Confirmation Modal */}
      {notificationToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <Card className="w-full max-w-md shadow-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600 text-base">
                <AlertTriangle className="h-5 w-5" />
                Confirm Deletion
              </CardTitle>
              <CardDescription className="text-slate-500 dark:text-slate-400">
                Are you sure you want to delete this notification? This action
                cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  {notificationToDelete.title}
                </p>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {notificationToDelete.message}
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2 bg-slate-50 dark:bg-slate-800/50 rounded-b-lg p-4">
              <Button
                variant="outline"
                onClick={() => setNotificationToDelete(null)}
                className="border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDeleteNotification}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                Delete
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </Layout>
  );
}