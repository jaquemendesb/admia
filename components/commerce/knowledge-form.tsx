"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  createKnowledgeSchema, type CreateKnowledgeInput,
  KNOWLEDGE_TYPES_ARRAY, KNOWLEDGE_TYPE_LABELS,
} from "@/lib/validation/knowledge"
import { toSlug } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubmitButton } from "@/components/forms/submit-button"
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface KnowledgeFormProps {
  defaultValues?: Partial<CreateKnowledgeInput & { id?: string }>
  channels?: { id: string; name: string }[]
  onSubmit: (data: CreateKnowledgeInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function KnowledgeForm({ defaultValues, channels = [], onSubmit, onCancel, loading }: KnowledgeFormProps) {
  const isEditing = !!defaultValues?.id
  const form = useForm({
    resolver: zodResolver(createKnowledgeSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      content: defaultValues?.content ?? "",
      knowledge_type: defaultValues?.knowledge_type ?? "FAQ",
      active: defaultValues?.active ?? true,
      business_channel_id: defaultValues?.business_channel_id ?? null,
    },
  })

  const titleValue = form.watch("title")
  useEffect(() => {
    if (!isEditing && titleValue) {
      form.setValue("slug", toSlug(titleValue), { shouldValidate: false })
    }
  }, [titleValue, isEditing, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreateKnowledgeInput))} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Título *</FormLabel>
            <FormControl><Input placeholder="Ex: Política de reembolso" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl><Input placeholder="politica-de-reembolso" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="knowledge_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {KNOWLEDGE_TYPES_ARRAY.map((t) => (
                    <SelectItem key={t} value={t}>{KNOWLEDGE_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          {channels.length > 0 && (
            <FormField control={form.control} name="business_channel_id" render={({ field }) => (
              <FormItem>
                <FormLabel>Canal</FormLabel>
                <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} defaultValue={field.value ?? "none"}>
                  <FormControl><SelectTrigger><SelectValue placeholder="Todos os canais" /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="none">Todos os canais</SelectItem>
                    {channels.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
          )}
        </div>
        <FormField control={form.control} name="content" render={({ field }) => (
          <FormItem>
            <FormLabel>Conteúdo *</FormLabel>
            <FormControl><Textarea rows={8} placeholder="Conteúdo completo do documento..." {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="active" render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <FormLabel className="cursor-pointer">Entrada ativa</FormLabel>
          </FormItem>
        )} />
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <SubmitButton loading={loading}>{isEditing ? "Salvar alterações" : "Criar entrada"}</SubmitButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
