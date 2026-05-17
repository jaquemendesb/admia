"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createCatalogItemSchema, type CreateCatalogItemInput } from "@/lib/validation/catalog"
import { toSlug } from "@/lib/utils"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { SubmitButton } from "@/components/forms/submit-button"
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

const SOURCE_TYPES = [
  { value: "MANUAL", label: "Manual" },
  { value: "WOOCOMMERCE", label: "WooCommerce" },
  { value: "INTERNAL", label: "Interno" },
  { value: "BLOG", label: "Blog" },
  { value: "URL", label: "URL" },
]
const ITEM_TYPES = [
  { value: "PRODUCT", label: "Produto" },
  { value: "COURSE", label: "Curso" },
  { value: "LESSON", label: "Aula" },
  { value: "ARTICLE", label: "Artigo" },
  { value: "DOWNLOAD", label: "Download" },
  { value: "BONUS", label: "Bônus" },
  { value: "MEMBERSHIP", label: "Membership" },
  { value: "RESOURCE", label: "Recurso" },
]

interface CatalogFormProps {
  defaultValues?: Partial<CreateCatalogItemInput & { id?: string }>
  onSubmit: (data: CreateCatalogItemInput) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function CatalogForm({ defaultValues, onSubmit, onCancel, loading }: CatalogFormProps) {
  const isEditing = !!defaultValues?.id
  const form = useForm({
    resolver: zodResolver(createCatalogItemSchema),
    defaultValues: {
      title: defaultValues?.title ?? "",
      slug: defaultValues?.slug ?? "",
      source_type: defaultValues?.source_type ?? "MANUAL",
      item_type: defaultValues?.item_type ?? "PRODUCT",
      sku: defaultValues?.sku ?? "",
      short_description: defaultValues?.short_description ?? "",
      price: defaultValues?.price ?? undefined,
      sale_price: defaultValues?.sale_price ?? undefined,
      currency: defaultValues?.currency ?? "BRL",
      active: defaultValues?.active ?? true,
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
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreateCatalogItemInput))} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
        <FormField control={form.control} name="title" render={({ field }) => (
          <FormItem>
            <FormLabel>Título *</FormLabel>
            <FormControl><Input placeholder="Nome do produto/curso" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl><Input placeholder="nome-do-produto" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="source_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Origem *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {SOURCE_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="item_type" render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                <SelectContent>
                  {ITEM_TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        </div>
        <FormField control={form.control} name="sku" render={({ field }) => (
          <FormItem>
            <FormLabel>SKU</FormLabel>
            <FormControl><Input placeholder="SKU-001" {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="short_description" render={({ field }) => (
          <FormItem>
            <FormLabel>Descrição curta</FormLabel>
            <FormControl><Textarea rows={2} {...field} value={field.value ?? ""} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="price" render={({ field }) => (
            <FormItem>
              <FormLabel>Preço</FormLabel>
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
            <FormLabel className="cursor-pointer">Item ativo</FormLabel>
          </FormItem>
        )} />
        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <SubmitButton loading={loading}>{isEditing ? "Salvar alterações" : "Criar item"}</SubmitButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
