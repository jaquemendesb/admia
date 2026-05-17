"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createOfferSchema, type CreateOfferInput } from "@/lib/validation/offers"
import { toSlug } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { SubmitButton } from "@/components/forms/submit-button"
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface OfferFormProps {
  defaultValues?: Partial<CreateOfferInput & { id?: string }>
  onSubmit: (data: CreateOfferInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function OfferForm({ defaultValues, onSubmit, onCancel, loading }: OfferFormProps) {
  const isEditing = !!defaultValues?.id
  const form = useForm({
    resolver: zodResolver(createOfferSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      description: defaultValues?.description ?? "",
      active: defaultValues?.active ?? true,
      base_price: defaultValues?.base_price ?? undefined,
      sale_price: defaultValues?.sale_price ?? undefined,
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
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreateOfferInput))} className="space-y-4">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Título *</FormLabel>
            <FormControl><Input placeholder="Ex: Pacote Mentoria + Canva" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl><Input placeholder="pacote-mentoria-canva" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="description" render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição</FormLabel>
            <FormControl><Textarea rows={3} {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="base_price" render={({ field }) => (
            <FormItem>
              <FormLabel>Preço base</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="0.00"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="sale_price" render={({ field }) => (
            <FormItem>
              <FormLabel>Preço promocional</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" min="0" placeholder="0.00"
                  value={field.value ?? ""}
                  onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="active" render={({ field }) => (
          <FormItem className="flex items-center gap-2 space-y-0">
            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
            <FormLabel className="cursor-pointer">Oferta ativa</FormLabel>
          </FormItem>
        )} />
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <SubmitButton loading={loading}>{isEditing ? "Salvar alterações" : "Criar oferta"}</SubmitButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
