import {
  RefreshCw,
  HelpCircle,
  ChevronDown,
  Maximize2,
  Bell,
  Menu,
  MessageCircle,
  RefreshCcwDot,
  LampDeskIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <div className="w-full p-3 border-b border-gray-200 flex items-center gap-2 bg-white shrink-0">
      <div className="flex items-center gap-2 text-gray-600">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MessageCircle size={18} />
        </Button>
        <span className="text-bold font-bold">chats</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex items-center gap-1 rounded-md"
        >
          <RefreshCcwDot size={16} />
          <span>Refresh</span>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-8 flex items-center gap-1 rounded-md"
        >
          <HelpCircle size={18} />
          <span>Help</span>
        </Button>

        <div className="flex items-center gap-1 text-sm text-yellow-500">
          <span>5 / 6 phones</span>
          <ChevronDown size={14} />
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Maximize2 size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Bell size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <Menu size={18} />
        </Button>
      </div>
    </div>
  );
}
