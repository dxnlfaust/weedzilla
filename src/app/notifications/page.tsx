"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, MessageCircle, Trophy, Loader2 } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils/formatters";
import { avatarSm } from "@/lib/utils/image";

interface NotificationRow {
  id: string;
  type: "comment" | "win";
  post_id: string | null;
  actor_id: string | null;
  message: string;
  is_read: boolean;
  created_at: string;
  actor: { display_name: string; avatar_url: string | null } | null;
}

export default function NotificationsPage() {
  const { user, setUnreadCount, loading: authLoading } = useAuth();
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace("/login?redirect=/notifications");
      return;
    }

    async function load() {
      const supabase = createClient();

      const { data } = await supabase
        .from("notifications")
        .select(
          `*, actor:actor_id (display_name, avatar_url)`
        )
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(50);

      setNotifications((data || []) as unknown as NotificationRow[]);
      setLoading(false);

      // Mark all as read
      await supabase.rpc("mark_notifications_read", { p_user_id: user!.id });
      setUnreadCount(0);
    }

    load();
  }, [user, authLoading]);

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-carbon mb-6 flex items-center gap-2">
        <Bell className="h-6 w-6" />
        Notifications
      </h1>

      {notifications.length === 0 ? (
        <div className="text-center py-12">
          <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No notifications yet.</p>
          <p className="text-sm text-gray-400 mt-1">
            You&apos;ll be notified when someone comments on your posts or you win a weekly competition.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
          {notifications.map((n) => (
            <NotificationItem key={n.id} notification={n} />
          ))}
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: NotificationRow }) {
  const isComment = notification.type === "comment";
  const href = notification.post_id ? `/post/${notification.post_id}` : "/winners";

  return (
    <Link
      href={href}
      className={`flex items-start gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
        !notification.is_read ? "bg-eucalypt/5" : ""
      }`}
    >
      {/* Icon or avatar */}
      {isComment && notification.actor ? (
        notification.actor.avatar_url ? (
          <img
            src={avatarSm(notification.actor.avatar_url)}
            alt={notification.actor.display_name}
            className="h-8 w-8 rounded-full object-cover shrink-0 mt-0.5"
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-eucalypt/10 flex items-center justify-center text-sm font-bold text-eucalypt shrink-0 mt-0.5">
            {notification.actor.display_name[0]?.toUpperCase()}
          </div>
        )
      ) : isComment ? (
        <div className="h-8 w-8 rounded-full bg-eucalypt/10 flex items-center justify-center shrink-0 mt-0.5">
          <MessageCircle className="h-4 w-4 text-eucalypt" />
        </div>
      ) : (
        <div className="h-8 w-8 rounded-full bg-gold/10 flex items-center justify-center shrink-0 mt-0.5">
          <Trophy className="h-4 w-4 text-gold" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="text-sm text-carbon">{notification.message}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>

      {!notification.is_read && (
        <span className="h-2 w-2 rounded-full bg-eucalypt shrink-0 mt-2" />
      )}
    </Link>
  );
}
