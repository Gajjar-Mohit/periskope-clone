import { RefreshCw, HelpCircle, ChevronDown, Maximize2, Bell, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Header() {
  return (
    <div className="p-3 border-b border-gray-200 flex items-center gap-2 bg-white">
      <div className="flex items-center gap-2 text-gray-600">
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <span className="text-sm">chats</span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <RefreshCw size={18} />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <HelpCircle size={18} />
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
  )
}
