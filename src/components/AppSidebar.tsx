
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";

import { UserRound, CreditCard } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "react-router-dom";

export function AppSidebar() {
  const [expanded, setExpanded] = useState(false);
  const [showChatDialog, setShowChatDialog] = useState(false);
  
  return (
    <div 
      className="bg-[#1A1F2C] border-r border-white/5 transition-all duration-300 ease-in-out w-14 hover:w-48"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <Sidebar variant="inset" collapsible="none">
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Main content will go here if needed */}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-white/5">
          <div className="p-2 space-y-2">
            <Link to="/billing">
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10"
              >
                <CreditCard className="h-4 w-4 mr-2" />
                <span className={cn(
                  "transition-all duration-200",
                  expanded ? "opacity-100" : "opacity-0"
                )}>
                  Billing
                </span>
              </Button>
            </Link>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="w-full justify-start text-white/70 hover:text-white hover:bg-white/10">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback>
                      <UserRound className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <span className={cn(
                    "ml-2 transition-all duration-200",
                    expanded ? "opacity-100" : "opacity-0"
                  )}>
                    Profile
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </SidebarFooter>
      </Sidebar>
    </div>
  );
}
