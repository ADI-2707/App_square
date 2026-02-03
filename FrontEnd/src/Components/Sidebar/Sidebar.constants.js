import { IoMdPricetags } from "react-icons/io";
import { MdSpaceDashboard } from "react-icons/md";
import { RiAlarmWarningFill } from "react-icons/ri";
import { FaFileCode, FaUserFriends } from "react-icons/fa";
import { BsDatabaseFillGear } from "react-icons/bs";
import { SiAdobeaudition } from "react-icons/si";
import { HiTemplate } from "react-icons/hi";
import { FaArrowTrendUp } from "react-icons/fa6";

export const SIDEBAR_ITEMS = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: MdSpaceDashboard,
    requiresProject: true,
    actions: [
      { id: "view-dashboard", label: "View Dashboard", action: "viewDashboard" },
      { id: "create-dashboard", label: "Create Dashboard", action: "createDashboard" },
    ],
  },
  {
    id: "alarm",
    label: "Alarm",
    icon: RiAlarmWarningFill,
    requiresProject: true,
    actions: [
      { id: "view-alarm", label: "View Alarms", action: "viewAlarm" },
      { id: "create-alarm", label: "Create Alarms", action: "createAlarm" },
    ],
  },
  {
    id: "trends",
    label: "Trends",
    icon: FaArrowTrendUp,
    requiresProject: true,
    actions: [
      { id: "view-trends", label: "View Trends", action: "viewTrends" },
      { id: "compare-trends", label: "Compare Trends", action: "compareTrends" },
    ],
  },
  {
    id: "data-logger",
    label: "Data Logger",
    icon: BsDatabaseFillGear,
    requiresProject: true,
    actions: [
      { id: "view-logs", label: "View Logs", action: "viewLogs" },
      { id: "log-settings", label: "Log Settings", action: "logSettings" },
    ],
  },
  {
    id: "recipe",
    label: "Recipe Management",
    icon: FaFileCode,
    requiresProject: true,
    actions: [
      { id: "view-recipe", label: "View Recipes", action: "open-view-recipe" },
      { id: "create-recipe", label: "Create Recipe", action: "open-create-recipe" },
    ],
  },
  {
    id: "tag",
    label: "Tag Management",
    icon: IoMdPricetags,
    requiresProject: true,
    actions: [
      { id: "add-tags", label: "Add Tags", action: "addTags" },
      { id: "manage-tags", label: "Manage Tags", action: "manageTags" },
    ],
  },
  {
    id: "users",
    label: "User Management",
    icon: FaUserFriends,
    requiresProject: true,
    actions: [
      { id: "see-users", label: "See Users", action: "seeUsers" },
      { id: "add-users", label: "Add Users", action: "addUsers" },
    ],
  },
  {
    id: "audit",
    label: "Audit Trail",
    icon: SiAdobeaudition,
    requiresProject: true,
    actions: [
      { id: "audit-history", label: "Audit History", action: "auditHistory" },
      { id: "analysis", label: "Analysis", action: "analysis" },
    ],
  },
  {
    id: "templates",
    label: "Templates",
    icon: HiTemplate,
    requiresProject: true,
    actions: [
      { id: "add-templates", label: "Add Templates", action: "addTemplates" },
      { id: "create-templates", label: "Create Templates", action: "createTemplates" },
    ],
  },
];