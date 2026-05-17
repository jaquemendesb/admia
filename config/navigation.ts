import {
  LayoutDashboard,
  ShoppingCart,
  Bot,
  Users,
  Wrench,
  Settings,
  type LucideIcon,
} from "lucide-react"
import type { Resource } from "@/types/rbac"

interface NavChild {
  title: string
  href: string
}

interface NavItem {
  title: string
  href: string
  icon: LucideIcon
  resource: Resource
  children?: NavChild[]
}

export const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    resource: "dashboard",
  },
  {
    title: "Comercial",
    href: "/commerce",
    icon: ShoppingCart,
    resource: "business_channels",
    children: [
      { title: "Canais", href: "/commerce/channels" },
      { title: "Catálogo", href: "/commerce/catalog" },
      { title: "Ofertas", href: "/commerce/offers" },
      { title: "Base de Conhecimento", href: "/commerce/knowledge" },
      { title: "Integrações", href: "/commerce/integrations" },
    ],
  },
  {
    title: "IA",
    href: "/ai",
    icon: Bot,
    resource: "personas",
    children: [
      { title: "Personas", href: "/ai/personas" },
      { title: "Agentes", href: "/ai/agents" },
      { title: "Configuração", href: "/ai/config" },
    ],
  },
  {
    title: "Contatos",
    href: "/contacts",
    icon: Users,
    resource: "contacts",
    children: [
      { title: "Todos os Contatos", href: "/contacts" },
      { title: "Políticas", href: "/contacts/policies" },
    ],
  },
  {
    title: "Operações",
    href: "/operations",
    icon: Wrench,
    resource: "maintenance_jobs",
    children: [
      { title: "Manutenção", href: "/operations/maintenance" },
      { title: "Logs de Sincronização", href: "/operations/sync-logs" },
      { title: "Integração Runtime", href: "/operations/runtime" },
      { title: "Saúde do Sistema", href: "/operations/system-health" },
    ],
  },
  {
    title: "Administração",
    href: "/administration",
    icon: Settings,
    resource: "users",
    children: [
      { title: "Usuários", href: "/administration/users" },
      { title: "Audit Logs", href: "/administration/audit" },
    ],
  },
]
