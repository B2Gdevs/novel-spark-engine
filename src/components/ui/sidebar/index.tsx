
export * from "./sidebar-context"
export * from "./sidebar-menu"
export * from "./sidebar-menu-sub" 
export * from "./sidebar-sections"

// Re-export everything from sidebar-core but be explicit to avoid ambiguity
import {
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter
} from "./sidebar-core";

export {
  Sidebar,
  SidebarInset,
  SidebarTrigger,
  SidebarContent,
  SidebarFooter
}
