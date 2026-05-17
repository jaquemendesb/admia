"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createContactPolicySchema, POLICY_TYPES_ARRAY, POLICY_TYPE_LABELS } from "@/lib/validation/contacts"
import type { CreateContactPolicyInput } from "@/lib/validation/contacts"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface ContactPolicyFormProps {
  onSubmit: (data: CreateContactPolicyInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function ContactPolicyForm({ onSubmit, onCancel, isSubmitting }: ContactPolicyFormProps) {
  const form = useForm({
    resolver: zodResolver(createContactPolicySchema),
    defaultValues: { policy_type: undefined, source_type: "MANUAL" as const, notes: "", active: true },
  })

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreateContactPolicyInput))} className="space-y-4">
        <FormField
          control={form.control}
          name="policy_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de política</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {POLICY_TYPES_ARRAY.map((t) => (
                    <SelectItem key={t} value={t}>{POLICY_TYPE_LABELS[t]}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={3} placeholder="Motivo ou contexto..." />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="active"
          render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <FormLabel className="cursor-pointer">Ativa</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : "Adicionar política"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
