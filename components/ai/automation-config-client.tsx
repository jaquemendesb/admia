"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Plus, Pencil, Trash2, Check, X } from "lucide-react"
import { createConfigSchema, updateConfigSchema, VALUE_TYPE_LABELS, VALUE_TYPES_ARRAY } from "@/lib/validation/automation-config"
import type { CreateConfigInput, UpdateConfigInput } from "@/lib/validation/automation-config"
import type { AutomationConfig } from "@prisma/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FormDialog } from "@/components/dialogs/form-dialog"
import { ConfirmDialog } from "@/components/dialogs/confirm-dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface AutomationConfigClientProps {
  configs: AutomationConfig[]
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
}

function CreateConfigForm({ onSubmit, onCancel, isSubmitting }: {
  onSubmit: (data: CreateConfigInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}) {
  const form = useForm({
    resolver: zodResolver(createConfigSchema),
    defaultValues: { config_key: "", config_value: "", value_type: "STRING" as const },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreateConfigInput))} className="space-y-4">
        <FormField
          control={form.control}
          name="config_key"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Chave</FormLabel>
              <FormControl>
                <Input {...field} placeholder="max_retry_attempts" className="font-mono" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="config_value"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Valor</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="3" className="font-mono" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="value_type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {VALUE_TYPES_ARRAY.map((t) => (
                      <SelectItem key={t} value={t}>{VALUE_TYPE_LABELS[t]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Criar configuração"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

interface InlineEditRowProps {
  config: AutomationConfig
  onSave: (id: string, data: UpdateConfigInput) => Promise<void>
  onCancel: () => void
}

function InlineEditRow({ config, onSave, onCancel }: InlineEditRowProps) {
  const form = useForm({
    resolver: zodResolver(updateConfigSchema),
    defaultValues: {
      config_value: config.config_value,
      value_type: config.value_type as "STRING" | "INTEGER" | "BOOLEAN" | "JSON",
    },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSave(config.id, data as UpdateConfigInput))}>
        <TableRow className="bg-muted/30">
          <TableCell>
            <span className="font-mono text-sm">{config.config_key}</span>
          </TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name="config_value"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <FormControl>
                    <Input {...field} className="font-mono text-sm h-8" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TableCell>
          <TableCell>
            <FormField
              control={form.control}
              name="value_type"
              render={({ field }) => (
                <FormItem className="space-y-0">
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-8 w-32">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {VALUE_TYPES_ARRAY.map((t) => (
                        <SelectItem key={t} value={t}>{VALUE_TYPE_LABELS[t]}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Button type="submit" variant="ghost" size="icon" className="h-8 w-8 text-green-600">
                <Check className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={onCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </TableCell>
        </TableRow>
      </form>
    </Form>
  )
}

export function AutomationConfigClient({ configs, canCreate, canEdit, canDelete }: AutomationConfigClientProps) {
  const router = useRouter()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<AutomationConfig | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleCreate(data: CreateConfigInput) {
    setLoading(true)
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao criar configuração")
        return
      }
      toast.success("Configuração criada")
      setCreateOpen(false)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleSave(id: string, data: UpdateConfigInput) {
    setLoading(true)
    try {
      const res = await fetch(`/api/config/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!res.ok) {
        const err = await res.json()
        toast.error(err.error ?? "Erro ao atualizar configuração")
        return
      }
      toast.success("Configuração atualizada")
      setEditingId(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setLoading(true)
    try {
      const res = await fetch(`/api/config/${deleteTarget.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast.error("Erro ao excluir configuração")
        return
      }
      toast.success("Configuração excluída")
      setDeleteTarget(null)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        {canCreate && (
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova configuração
          </Button>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Chave</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="w-[120px]">Tipo</TableHead>
              <TableHead className="w-[80px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {configs.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                  Nenhuma configuração cadastrada.
                </TableCell>
              </TableRow>
            )}
            {configs.map((config) =>
              editingId === config.id ? (
                <InlineEditRow
                  key={config.id}
                  config={config}
                  onSave={handleSave}
                  onCancel={() => setEditingId(null)}
                />
              ) : (
                <TableRow key={config.id}>
                  <TableCell>
                    <span className="font-mono text-sm">{config.config_key}</span>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm text-muted-foreground break-all">{config.config_value}</span>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {VALUE_TYPE_LABELS[config.value_type as keyof typeof VALUE_TYPE_LABELS] ?? config.value_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {canEdit && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditingId(config.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(config)}
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

      <FormDialog open={createOpen} onOpenChange={setCreateOpen} title="Nova configuração">
        <CreateConfigForm
          onSubmit={handleCreate}
          onCancel={() => setCreateOpen(false)}
          isSubmitting={loading}
        />
      </FormDialog>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(o) => { if (!o) setDeleteTarget(null) }}
        title="Excluir configuração"
        description={`Tem certeza que deseja excluir a chave "${deleteTarget?.config_key}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Excluir"
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}
