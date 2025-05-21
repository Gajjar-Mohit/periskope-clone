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
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BsChatDotsFill } from "react-icons/bs";


export default function Header() {
  return (
    <div className="w-full p-3 border-b border-gray-200 flex items-center gap-2 bg-white shrink-0">
      <div className="flex items-center gap-2 text-gray-600">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <BsChatDotsFill size={18} />
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

        <Button
          variant="outline"
          size="sm"
          className="h-8 flex items-center gap-1 rounded-md"
        >
          <div className="bg-yellow-400 h-3 w-3 rounded-full" />
          <span className="text-black">5 / 6 phones</span>
          <div className="flex flex-col">
            <ChevronUp size={10} className="mb-[-3px]" />
            <ChevronDown size={10} className="" />
          </div>
        </Button>
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
