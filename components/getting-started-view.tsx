import { BookOpen, Video, MessageSquare, Users, Ticket, Link, Webhook } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GettingStartedView() {
  return (
    <div className="flex-1 overflow-auto p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Getting Started</h1>
          <p className="text-gray-600 mt-1">Follow the steps to connect your phone to Periskope</p>
        </div>

        <div className="flex justify-end gap-3 mb-8">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <BookOpen size={16} />
            Book a demo
          </Button>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Video size={16} />
            Watch Tutorial
          </Button>
        </div>

        <div className="bg-white rounded-lg p-8 mb-8 flex flex-col items-center justify-center text-center">
          <p className="text-gray-700 mb-4">Your phone server is switched off. Please restart</p>
          <Button className="bg-green-600 hover:bg-green-700 flex items-center gap-2">
            <span className="text-sm">Restart phone</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bulk messages */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={18} className="text-gray-700" />
              <h3 className="font-medium">Bulk messages</h3>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-gray-400"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">Send or schedule customized bulk messages</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Docs
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <Video size={14} className="mr-1" />
                Watch Tutorial
              </Button>
            </div>
          </div>

          {/* Manage Team */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Users size={18} className="text-gray-700" />
              <h3 className="font-medium">Manage Team</h3>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-gray-400"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">Add / remove team members and manage access to chats</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Docs
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <Video size={14} className="mr-1" />
                Watch Tutorial
              </Button>
            </div>
          </div>

          {/* Add phones */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
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
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <h3 className="font-medium">Add phones</h3>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-gray-400"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">Connect multiple WhatsApp numbers to Periskope</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Docs
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <Video size={14} className="mr-1" />
                Watch Tutorial
              </Button>
            </div>
          </div>

          {/* Manage tickets */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Ticket size={18} className="text-gray-700" />
              <h3 className="font-medium">Manage tickets</h3>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-gray-400"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">Create tickets from your WA messages with an emoji</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Docs
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <Video size={14} className="mr-1" />
                Watch Tutorial
              </Button>
            </div>
          </div>

          {/* Integrate your tools */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Link size={18} className="text-gray-700" />
              <h3 className="font-medium">Integrate your tools</h3>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-gray-400"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Link Periskope account to HubSpot / Freshdesk / GSheets / Zoho desk
            </p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Docs
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <Video size={14} className="mr-1" />
                Watch Tutorial
              </Button>
            </div>
          </div>

          {/* APIs & Webhooks */}
          <div className="bg-white rounded-lg p-6 border border-gray-100">
            <div className="flex items-center gap-2 mb-4">
              <Webhook size={18} className="text-gray-700" />
              <h3 className="font-medium">APIs & Webhooks</h3>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="ml-auto text-gray-400"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
            <p className="text-sm text-gray-600 mb-4">Build custom automations using our APIs and webhooks</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                </svg>
                Docs
              </Button>
              <Button variant="outline" size="sm" className="text-xs h-7 px-2">
                <Video size={14} className="mr-1" />
                Watch Tutorial
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
