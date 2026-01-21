import React, { useEffect, useRef } from 'react';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useNotifications } from '@/hooks/useNotifications';
import { useNotificationSound } from '@/hooks/useNotificationSound';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const { playNotificationSound } = useNotificationSound();
  
  // Ref to track previous count to detect NEW notifications
  const prevCountRef = useRef(unreadCount);

  useEffect(() => {
    // If count increased, it means a new notification arrived
    if (unreadCount > prevCountRef.current) {
        playNotificationSound();
    }
    prevCountRef.current = unreadCount;
  }, [unreadCount, playNotificationSound]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-white">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white ring-2 ring-[#0a0a0a]">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-[#0a0a0a] border-zinc-800 text-white">
        <DropdownMenuLabel className="flex items-center justify-between font-normal">
          <span className="font-semibold">Bildirimler</span>
          {unreadCount > 0 && (
            <span 
                className="text-xs text-[#FF6200] cursor-pointer hover:underline"
                onClick={(e) => {
                    e.preventDefault();
                    markAllAsRead();
                }}
            >
                Tümünü okundu işaretle
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-zinc-800" />
        <ScrollArea className="h-[300px]">
          {notifications.length === 0 ? (
            <div className="flex h-[100px] items-center justify-center text-sm text-zinc-500">
              Bildiriminiz yok.
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className="flex flex-col items-start gap-1 p-3 focus:bg-zinc-900 cursor-pointer border-b border-zinc-900 last:border-0"
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full justify-between items-start gap-2">
                   <p className="text-sm leading-snug">{notification.message}</p>
                   <div className="w-2 h-2 rounded-full bg-[#FF6200] mt-1.5 flex-shrink-0" />
                </div>
                <span className="text-xs text-zinc-500">
                  {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: tr })}
                </span>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}