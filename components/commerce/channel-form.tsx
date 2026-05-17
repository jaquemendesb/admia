"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import type { BusinessChannel } from "@prisma/client"
import { createChannelSchema, type CreateChannelInput } from "@/lib/validation/channels"
import { toSlug } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { SubmitButton } from "@/components/forms/submit-button"
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface ChannelFormProps {
  defaultValues?: Partial<BusinessChannel>
  onSubmit: (data: CreateChannelInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function ChannelForm({ defaultValues, onSubmit, onCancel, loading }: ChannelFormProps) {
  const form = useForm({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      active: defaultValues?.active ?? true,
      priority: defaultValues?.priority ?? 0,
      icon: defaultValues?.icon ?? "",
      color: defaultValues?.color ?? "",
    },
  })

  const nameValue = form.watch("name")
  const isEditing = !!defaultValues?.id

  useEffect(() => {
    if (!isEditing && nameValue) {
      form.setValue("slug", toSlug(nameValue), { shouldValidate: false })
    }
  }, [nameValue, isEditing, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreateChannelInput))} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl><Input placeholder="Ex: Loja das Profs" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug *</FormLabel>
              <FormControl><Input placeholder="loja-das-profs" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea placeholder="Descrição do canal..." rows={3} {...field} value={field.value ?? ""} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prioridade</FormLabel>
                <FormControl>
                  <Input type="number" min={0} {...field} onChange={(e) => field.onChange(Number(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor (hex)</FormLabel>
                <FormControl><Input placeholder="#24224C" {...field} value={field.value ?? ""} /></FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="cursor-pointer">Canal ativo</FormLabel>
            </FormItem>
          )}
        />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <SubmitButton loading={loading}>{isEditing ? "Salvar alterações" : "Criar canal"}</SubmitButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
