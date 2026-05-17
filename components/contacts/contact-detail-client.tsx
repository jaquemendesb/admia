"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus, Trash2, Pencil, Check, X } from "lucide-react"
import type { Contact, ContactPolicy, ContactMemory, PolicyLog } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FormDialog } from "@/components/dialogs/form-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { ContactPolicyForm } from "./contact-policy-form"
import { POLICY_TYPE_LABELS, POLICY_SOURCE_LABELS } from "@/lib/validation/contacts"
import type { CreateContactPolicyInput } from "@/lib/validation/contacts"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { updateContactMemorySchema } from "@/lib/validation/contacts"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"

type ContactFull = Contact & {
  contact_policies: ContactPolicy[]
  contact_memory: ContactMemory[]
  _count: { conversations: number; messages: number }
}

interface ContactDetailClientProps {
  contact: ContactFull
  policyLogs: PolicyLog[]
  canEditMemory: boolean
  canDeleteMemory: boolean
  canCreatePolicy: boolean
  canEditPolicy: boolean
  canDeletePolicy: boolean
}

function InlineMemoryEdit({
  memory,
  onSave,
  onCancel,
}: {
  memory: ContactMemory
  onSave: (id: string, value: string) => Promise<void>
  onCancel: () => void
}) {
  const form = useForm({
    resolver: zodResolver(updateContactMemorySchema),
    defaultValues: { memory_value: memory.memory_value, confidence: memory.confidence ?? undefined },
  })
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => onSave(memory.id, d.memory_value))} className="flex gap-2 items-center">
        <FormField
          control={form.control}
          name="memory_value"
          render={({ field }) => (
            <FormItem className="flex-1 space-y-0">
              <FormControl>
                <Input {...field} className="h-8 text-sm font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-green-600 shrink-0">
          <Check className="h-4 w-4" />
        </Button>
        <Button type="button" variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={onCancel}>
          <X className="h-4 w-4" />
        </Button>
      </form>
    </Form>
  )
}

export function ContactDetailClient({
  contact,
  policyLogs,
  canEditMemory,
  canDeleteMemory,
  canCreatePolicy,
  canEditPolicy,
  canDeletePolicy,
}: ContactDetailClientProps) {
  const router = useRouter()
  const [addPolicyOpen, setAddPolicyOpen] = useState(false)
  const [deletePolicy, setDeletePolicy] = useState<ContactPolicy | null>(null)
  const [editingMemoryId, setEditingMemoryId] = useState<string | null>(null)
  const [deleteMemory, setDeleteMemory] = useState<ContactMemory | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAddPolicy(data: CreateContactPolicyInput) {
    setLoading(true)
    try {
      const res = await fetch(`/api/contacts/${contact.id}/policies`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao adicionar política")
        return
      }
      toast.success("Política adicionada")
      setAddPolicyOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleTogglePolicy(policy: ContactPolicy) {
    const res = await fetch(`/api/contacts/${contact.id}/policies/${policy.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !policy.active }),
    })
    if (!res.ok) { toast.error("Erro ao atualizar política"); return }
    toast.success(policy.active ? "Política desativada" : "Política ativada")
    router.refresh()
  }

  async function handleDeletePolicy() {
    if (!deletePolicy) return
    setLoading(true)
    try {
      const res = await fetch(`/api/contacts/${contact.id}/policies/${deletePolicy.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Erro ao excluir política"); return }
      toast.success("Política excluída")
      setDeletePolicy(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleSaveMemory(id: string, value: string) {
    const res = await fetch(`/api/contacts/${contact.id}/memory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memory_value: value }),
    })
    if (!res.ok) { toast.error("Erro ao atualizar memória"); return }
    toast.success("Memória atualizada")
    setEditingMemoryId(null)
    router.refresh()
  }

  async function handleDeleteMemory() {
    if (!deleteMemory) return
    setLoading(true)
    try {
      const res = await fetch(`/api/contacts/${contact.id}/memory/${deleteMemory.id}`, { method: "DELETE" })
      if (!res.ok) { toast.error("Erro ao excluir memória"); return }
      toast.success("Memória excluída")
      setDeleteMemory(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Tabs defaultValue="policies">
        <TabsList>
          <TabsTrigger value="policies">
            Políticas ({contact.contact_policies.length})
          </TabsTrigger>
          <TabsTrigger value="memory">
            Memória ({contact.contact_memory.length})
          </TabsTrigger>
          <TabsTrigger value="logs">
            Logs de política ({policyLogs.length})
          </TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="mt-4">
          <div className="flex justify-end mb-3">
            {canCreatePolicy && (
              <Button size="sm" onClick={() => setAddPolicyOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Adicionar política
              </Button>
            )}
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Observações</TableHead>
                  <TableHead>Criada em</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contact.contact_policies.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Nenhuma política cadastrada.
                    </TableCell>
                  </TableRow>
                )}
                {contact.contact_policies.map((policy) => (
                  <TableRow key={policy.id}>
                    <TableCell>
                      <Badge
                        variant={policy.policy_type === "BLACKLIST" ? "destructive" : policy.policy_type === "WHITELIST" ? "success" : "secondary"}
                      >
                        {POLICY_TYPE_LABELS[policy.policy_type as keyof typeof POLICY_TYPE_LABELS]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {POLICY_SOURCE_LABELS[policy.source_type as keyof typeof POLICY_SOURCE_LABELS]}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={policy.active ? "success" : "secondary"}>
                        {policy.active ? "Ativa" : "Inativa"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground line-clamp-1">{policy.notes ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(policy.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {canEditPolicy && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground"
                            onClick={() => handleTogglePolicy(policy)}
                            title={policy.active ? "Desativar" : "Ativar"}
                          >
                            {policy.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                          </Button>
                        )}
                        {canDeletePolicy && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeletePolicy(policy)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Memory Tab */}
        <TabsContent value="memory" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[220px]">Chave</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead className="w-[80px]">Confiança</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {contact.contact_memory.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhuma memória registrada.
                    </TableCell>
                  </TableRow>
                )}
                {contact.contact_memory.map((mem) =>
                  editingMemoryId === mem.id ? (
                    <TableRow key={mem.id} className="bg-muted/30">
                      <TableCell>
                        <span className="font-mono text-sm">{mem.memory_key}</span>
                      </TableCell>
                      <TableCell colSpan={2}>
                        <InlineMemoryEdit
                          memory={mem}
                          onSave={handleSaveMemory}
                          onCancel={() => setEditingMemoryId(null)}
                        />
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  ) : (
                    <TableRow key={mem.id}>
                      <TableCell>
                        <span className="font-mono text-sm">{mem.memory_key}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground break-all">{mem.memory_value}</span>
                      </TableCell>
                      <TableCell>
                        {mem.confidence != null ? (
                          <span className="text-xs">{Math.round(mem.confidence * 100)}%</span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {canEditMemory && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setEditingMemoryId(mem.id)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          )}
                          {canDeleteMemory && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => setDeleteMemory(mem)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Policy Logs Tab */}
        <TabsContent value="logs" className="mt-4">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {policyLogs.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      Nenhum log registrado.
                    </TableCell>
                  </TableRow>
                )}
                {policyLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Badge variant="outline">
                        {POLICY_TYPE_LABELS[log.policy_type as keyof typeof POLICY_TYPE_LABELS] ?? log.policy_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-mono">{log.action}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{log.source ?? "—"}</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.created_at).toLocaleString("pt-BR")}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>

      <FormDialog open={addPolicyOpen} onOpenChange={setAddPolicyOpen} title="Adicionar política">
        <ContactPolicyForm
          onSubmit={handleAddPolicy}
          onCancel={() => setAddPolicyOpen(false)}
          isSubmitting={loading}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deletePolicy}
        onOpenChange={(o) => { if (!o) setDeletePolicy(null) }}
        title="Excluir política"
        description="Tem certeza que deseja excluir esta política? Esta ação não pode ser desfeita."
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeletePolicy}
      />

      <ConfirmDialog
        open={!!deleteMemory}
        onOpenChange={(o) => { if (!o) setDeleteMemory(null) }}
        title="Excluir memória"
        description={`Excluir a chave "${deleteMemory?.memory_key}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDeleteMemory}
      />
    </>
  )
}
