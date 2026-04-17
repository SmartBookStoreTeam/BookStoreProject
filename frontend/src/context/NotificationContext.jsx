/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useAuth } from "./AuthContext";
import { getMyOrders } from "../api/ordersApi";
import { getMyAuthorApplication } from "../api/authorApi";
import AuthorStatusModal from "../components/AuthorStatusModal";

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider",
    );
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [statusModal, setStatusModal] = useState({ open: false, status: null, data: null });
  const processedOrderIds = useRef(new Set());
  const pollingIntervalRef = useRef(null);
  const authorStatusPollingIntervalRef = useRef(null);
  const userProfilePollingIntervalRef = useRef(null);
  const lastAuthorStatus = useRef(null);
  const lastUserRole = useRef(user?.role);

  // Storage keys for persistence
  const getStorageKey = (userId, key) => `notifications_${userId}_${key}`;
  const getDeletedNotificationsKey = (userId) =>
    getStorageKey(userId, "deleted");
  const getReadNotificationsKey = (userId) => getStorageKey(userId, "read");

  // Get deleted notifications from localStorage
  const getDeletedNotifications = (userId) => {
    try {
      const stored = localStorage.getItem(getDeletedNotificationsKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Get read notifications from localStorage
  const getReadNotifications = (userId) => {
    try {
      const stored = localStorage.getItem(getReadNotificationsKey(userId));
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  };

  // Save deleted notifications to localStorage
  const saveDeletedNotifications = (userId, deletedIds) => {
    try {
      localStorage.setItem(
        getDeletedNotificationsKey(userId),
        JSON.stringify(deletedIds),
      );
    } catch (error) {
      console.warn("Failed to save deleted notifications:", error);
    }
  };

  // Save read notifications to localStorage
  const saveReadNotifications = (userId, readIds) => {
    try {
      localStorage.setItem(
        getReadNotificationsKey(userId),
        JSON.stringify(readIds),
      );
    } catch (error) {
      console.warn("Failed to save read notifications:", error);
    }
  };

  // Check for new approved orders
  const checkForApprovedOrders = async () => {
    if (!user) return;

    try {
      const orders = await getMyOrders();

      // Handle different response formats
      let ordersArray = [];
      if (Array.isArray(orders)) {
        ordersArray = orders;
      } else if (orders?.data && Array.isArray(orders.data)) {
        ordersArray = orders.data;
      } else if (orders?.success && Array.isArray(orders.data)) {
        ordersArray = orders.data;
      } else if (orders?.orders && Array.isArray(orders.orders)) {
        ordersArray = orders.orders;
      }

      // Get deleted and read notifications from storage
      const deletedNotifications = getDeletedNotifications(user._id);
      const readNotifications = getReadNotifications(user._id);

      // Get the time 24 hours ago to check for recently approved orders
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Find newly approved orders
      const approvedOrders = ordersArray.filter((order) => {
        if (order.status !== "approved") return false;

        // Get the order update time
        const updatedAt = order.updatedAt
          ? new Date(order.updatedAt)
          : order.createdAt
            ? new Date(order.createdAt)
            : null;

        // Check if we've already processed this order
        if (processedOrderIds.current.has(order._id)) {
          // If order was updated recently (within last 24 hours), show notification again
          if (updatedAt && updatedAt > twentyFourHoursAgo) {
            processedOrderIds.current.delete(order._id);
            return true;
          }
          return false;
        }

        // New order that hasn't been processed
        if (!updatedAt) {
          const createdAt = order.createdAt ? new Date(order.createdAt) : null;
          if (createdAt && createdAt > twentyFourHoursAgo) {
            return true;
          } else if (!createdAt) {
            return true;
          }
        } else if (updatedAt > twentyFourHoursAgo) {
          return true;
        }

        return false;
      });

      // Create notifications for newly approved orders
      approvedOrders.forEach((order) => {
        if (!order.items || order.items.length === 0) return;

        order.items.forEach((item) => {
          const bookTitle = item.title || item.book?.title || "Unknown Book";
          const notificationId = `${order._id}-${item.book?._id || item.book || Date.now()}`;

          // Skip if notification was deleted
          if (deletedNotifications.includes(notificationId)) {
            return;
          }

          // Determine if notification should be marked as read
          const isRead = readNotifications.includes(notificationId);

          const notification = {
            id: notificationId,
            orderId: order._id,
            bookTitle: bookTitle,
            timestamp: order.updatedAt ? new Date(order.updatedAt) : new Date(),
            read: isRead,
          };

          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === notification.id);
            if (!exists) {
              return [notification, ...prev];
            }
            return prev;
          });

          // Mark this order as processed
          processedOrderIds.current.add(order._id);
        });
      });
       
    } catch (error) {
      // Silent fail for notifications to avoid console spam
    }
  };

  // Check for user role changes (e.g. user -> author)
  const checkForRoleChanges = async () => {
    if (!user) return;

    try {
      const response = await refreshUser();
      if (!response?.success) return;

      const currentUser = response.user;
      const currentRole = currentUser.role;

      if (
        lastUserRole.current &&
        lastUserRole.current !== currentRole &&
        currentRole === "author"
      ) {
        const notificationId = `role-change-${user._id}-${currentRole}`;
        const deletedNotifications = getDeletedNotifications(user._id);

        if (!deletedNotifications.includes(notificationId)) {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === notificationId);
            if (exists) return prev;

            return [
              {
                id: notificationId,
                type: "role_change",
                role: currentRole,
                timestamp: new Date(),
                read: false,
              },
              ...prev,
            ];
          });
        }
      }

      lastUserRole.current = currentRole;
     
    } catch (error) {
      // Silent fail
    }
  };

  // Check for author application status updates
  const checkForAuthorApplicationStatus = async () => {
    if (!user || user.role === "admin") return;
    
    // If already an author and status is approved, we don't need to poll anymore
    if (user.role === "author" && user.applicationStatus === "approved") return;

    try {
      let applicationData = null;
      let currentStatus = null;

      try {
        const response = await getMyAuthorApplication();
        // If response.data is null (our new 200 OK fix), just return
        if (!response || response.data === null) {
          return;
        }
        applicationData = response?.data || response;
        currentStatus = applicationData?.status;
      } catch (err) {
        // Fallback to user object if application doc doesn't exist yet
        if (user.applicationStatus && user.applicationStatus !== "none") {
          currentStatus = user.applicationStatus;
          applicationData = { status: currentStatus };
        }
      }

      if (!currentStatus) return;

      // Handle Modal Triggering
      if (currentStatus === "pending") {
        // IMPORTANT: If user is already an author, don't show pending modal even if application says so
        if (user.role === "author") return;

        const sessionShown = sessionStorage.getItem(`pending_modal_shown_${user._id}`);
        if (!sessionShown) {
          setStatusModal({ open: true, status: "pending", data: applicationData });
          sessionStorage.setItem(`pending_modal_shown_${user._id}`, "true");
        }
      } else if (currentStatus === "approved" || currentStatus === "rejected") {
        const lastNotified = localStorage.getItem(`last_notified_status_${user._id}`);
        
        if (lastNotified !== currentStatus) {
          setStatusModal({ open: true, status: currentStatus, data: applicationData });
          localStorage.setItem(`last_notified_status_${user._id}`, currentStatus);
        }

        // Notification logic (existing)
        const notificationId = `author-status-${user._id}-${currentStatus}`;
        const deletedNotifications = getDeletedNotifications(user._id);

        if (!deletedNotifications.includes(notificationId)) {
          setNotifications((prev) => {
            const exists = prev.some((n) => n.id === notificationId);
            if (exists) return prev;

            return [
              {
                id: notificationId,
                type: "author_status",
                status: currentStatus,
                timestamp: applicationData.reviewedAt || new Date(),
                read: false,
              },
              ...prev,
            ];
          });
        }
      }

      lastAuthorStatus.current = currentStatus;
     
    } catch (error) {
      // Silent fail
    }
  };

  // Load notifications from localStorage when user changes
  useEffect(() => {
    if (user) {
      // Load deleted and read notifications from storage
      const deletedNotifications = getDeletedNotifications(user._id);
      const readNotifications = getReadNotifications(user._id);

      // Filter out deleted notifications and mark read ones
      setNotifications((prev) => {
        return prev
          .filter(
            (notification) => !deletedNotifications.includes(notification.id),
          )
          .map((notification) => ({
            ...notification,
            read:
              notification.read || readNotifications.includes(notification.id),
          }));
      });
    } else {
      // Clear notifications when user logs out
      setNotifications([]);
      setUnreadCount(0);
      processedOrderIds.current.clear();
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (authorStatusPollingIntervalRef.current) {
        clearInterval(authorStatusPollingIntervalRef.current);
      }
      if (userProfilePollingIntervalRef.current) {
        clearInterval(userProfilePollingIntervalRef.current);
      }
      lastAuthorStatus.current = null;
      lastUserRole.current = null;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Poll for approved orders every 30 seconds
  useEffect(() => {
    if (!user) {
      return;
    }

    // Initial check after a short delay to ensure user is fully loaded
    const initialTimeout = setTimeout(() => {
      checkForApprovedOrders();
    }, 2000);

    // Set up polling interval (30 seconds for orders)
    pollingIntervalRef.current = setInterval(() => {
      checkForApprovedOrders();
    }, 30000);

    // Initial author status check
    checkForAuthorApplicationStatus();
    authorStatusPollingIntervalRef.current = setInterval(() => {
      checkForAuthorApplicationStatus();
    }, 60000);

    // Initial role change check
    checkForRoleChanges();
    userProfilePollingIntervalRef.current = setInterval(() => {
      checkForRoleChanges();
    }, 120000);

    return () => {
      clearTimeout(initialTimeout);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
      if (authorStatusPollingIntervalRef.current) {
        clearInterval(authorStatusPollingIntervalRef.current);
      }
      if (userProfilePollingIntervalRef.current) {
        clearInterval(userProfilePollingIntervalRef.current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // Update unread count when notifications change
  useEffect(() => {
    const unread = notifications.filter((n) => !n.read).length;
    setUnreadCount(unread);
  }, [notifications]);

  const markAsRead = (notificationId) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)),
    );

    // Save to localStorage if user exists
    if (user) {
      const readNotifications = getReadNotifications(user._id);
      if (!readNotifications.includes(notificationId)) {
        const updatedRead = [...readNotifications, notificationId];
        saveReadNotifications(user._id, updatedRead);
      }
    }
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

    // Save all current notifications as read in localStorage
    if (user) {
      const currentNotificationIds = notifications.map((n) => n.id);
      const readNotifications = getReadNotifications(user._id);
      const updatedRead = [
        ...new Set([...readNotifications, ...currentNotificationIds]),
      ];
      saveReadNotifications(user._id, updatedRead);
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
    setUnreadCount(0);
  };

  const removeNotification = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

    // Save to localStorage if user exists
    if (user) {
      const deletedNotifications = getDeletedNotifications(user._id);
      if (!deletedNotifications.includes(notificationId)) {
        const updatedDeleted = [...deletedNotifications, notificationId];
        saveDeletedNotifications(user._id, updatedDeleted);
      }
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        removeNotification,
      }}
    >
      {statusModal.open && (
        <AuthorStatusModal 
          status={statusModal.status} 
          applicationData={statusModal.data}
          onClose={() => setStatusModal({ ...statusModal, open: false })} 
        />
      )}
      {children}
    </NotificationContext.Provider>
  );
};
