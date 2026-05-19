"use client"

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createIntegrationSchema, updateIntegrationSchema, type CreateIntegrationInput } from "@/lib/validation/integrations"
import { toSlug } from "@/lib/utils"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { SubmitButton } from "@/components/forms/submit-button"
import { DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Copy } from "lucide-react"
import { toast } from "sonner"

type IntegrationRow = {
  id: string
  name: string
  slug: string
  integration_type: string
  base_url: string
  active: boolean
  sync_enabled: boolean
  default_channel_id: string | null
  webhook_secret?: string | null
}

interface IntegrationFormProps {
  defaultValues?: Partial<IntegrationRow>
  channels?: { id: string; name: string }[]
  onSubmit: (data: CreateIntegrationInput | Record<string, unknown>) => Promise<void>
  onCancel: () => void
  loading?: boolean
}

export function IntegrationForm({ defaultValues, channels = [], onSubmit, onCancel, loading }: IntegrationFormProps) {
  const isEditing = !!defaultValues?.id

  const form = useForm({
    resolver: zodResolver(isEditing ? (updateIntegrationSchema as unknown as typeof createIntegrationSchema) : createIntegrationSchema),
    defaultValues: {
      name: defaultValues?.name ?? "",
      slug: defaultValues?.slug ?? "",
      integration_type: "WOOCOMMERCE",
      base_url: defaultValues?.base_url ?? "",
      consumer_key: "",
      consumer_secret: "",
      active: defaultValues?.active ?? true,
      sync_enabled: defaultValues?.sync_enabled ?? false,
      default_channel_id: defaultValues?.default_channel_id ?? null,
      webhook_secret: defaultValues?.webhook_secret ?? "",
    },
  })

  const nameValue = form.watch("name")
  useEffect(() => {
    if (!isEditing && nameValue) {
      form.setValue("slug", toSlug(nameValue), { shouldValidate: false })
    }
  }, [nameValue, isEditing, form])

  async function handleSubmit(raw: Record<string, unknown>) {
    const data = raw as CreateIntegrationInput
    if (isEditing) {
      const patch: Record<string, unknown> = {}
      if (data.name) patch.name = data.name
      if (data.slug) patch.slug = data.slug
      if (data.base_url) patch.base_url = data.base_url
      if (data.consumer_key) patch.consumer_key = data.consumer_key
      if (data.consumer_secret) patch.consumer_secret = data.consumer_secret
      patch.active = data.active
      patch.sync_enabled = data.sync_enabled
      patch.default_channel_id = data.default_channel_id
      patch.webhook_secret = data.webhook_secret || null
      await onSubmit(patch)
    } else {
      await onSubmit(data)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((d) => handleSubmit(d as Record<string, unknown>))} className="space-y-4">
        <FormField control={form.control} name="name" render={({ field }) => (
          <FormItem>
            <FormLabel>Nome *</FormLabel>
            <FormControl><Input placeholder="Loja das Profs — WooCommerce" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="slug" render={({ field }) => (
          <FormItem>
            <FormLabel>Slug *</FormLabel>
            <FormControl><Input placeholder="loja-das-profs-woo" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="base_url" render={({ field }) => (
          <FormItem>
            <FormLabel>URL base da loja *</FormLabel>
            <FormControl><Input placeholder="https://loja.jaquemendes.com" {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="consumer_key" render={({ field }) => (
          <FormItem>
            <FormLabel>{isEditing ? "Consumer Key (deixe em branco para manter)" : "Consumer Key *"}</FormLabel>
            <FormControl><Input type="password" autoComplete="off" placeholder={isEditing ? "••••••••••••" : "ck_..."} {...field} /></FormControl>
            <FormMessage />
          </FormItem>
        )} />
        <FormField control={form.control} name="consumer_secret" render={({ field }) => (
          <FormItem>
            <FormLabel>{isEditing ? "Consumer Secret (deixe em branco para manter)" : "Consumer Secret *"}</FormLabel>
            <FormControl><Input type="password" autoComplete="off" placeholder={isEditing ? "••••••••••••" : "cs_..."} {...field} /></FormControl>
            {isEditing && <FormDescription>Deixe em branco para manter as credenciais atuais.</FormDescription>}
            <FormMessage />
          </FormItem>
        )} />
        {channels.length > 0 && (
          <FormField control={form.control} name="default_channel_id" render={({ field }) => (
            <FormItem>
              <FormLabel>Canal padrão</FormLabel>
              <Select onValueChange={(v) => field.onChange(v === "none" ? null : v)} defaultValue={field.value ?? "none"}>
                <FormControl><SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger></FormControl>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {channels.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}
        {isEditing && defaultValues?.id && (
          <div className="space-y-3 rounded-md border p-3 bg-muted/40 overflow-hidden">
            <p className="text-sm font-medium">Webhook WooCommerce</p>
            <div className="space-y-1 min-w-0">
              <p className="text-xs text-muted-foreground">URL para configurar em WooCommerce → Avançado → Webhooks</p>
              <div className="flex items-center gap-2 min-w-0">
                <code className="min-w-0 flex-1 block truncate rounded bg-background px-2 py-1 text-xs border">
                  {`https://admia.jaquemendes.com/api/runtime/woo-webhook?integration_id=${defaultValues.id}`}
                </code>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={() => {
                    navigator.clipboard.writeText(`https://admia.jaquemendes.com/api/runtime/woo-webhook?integration_id=${defaultValues.id}`)
                    toast.success("URL copiada")
                  }}
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <FormField control={form.control} name="webhook_secret" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Segredo do webhook</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    autoComplete="off"
                    placeholder="Cole o segredo gerado no WooCommerce"
                    {...field}
                    value={field.value ?? ""}
                  />
                </FormControl>
                <FormDescription className="text-xs">
                  Mesmo valor configurado no campo &quot;Segredo&quot; do webhook no WooCommerce. Deixe em branco para aceitar chamadas sem validação.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}

        <div className="flex gap-6">
          <FormField control={form.control} name="active" render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="cursor-pointer">Ativa</FormLabel>
            </FormItem>
          )} />
          <FormField control={form.control} name="sync_enabled" render={({ field }) => (
            <FormItem className="flex items-center gap-2 space-y-0">
              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
              <FormLabel className="cursor-pointer">Sincronização habilitada</FormLabel>
            </FormItem>
          )} />
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <SubmitButton loading={loading}>{isEditing ? "Salvar alterações" : "Criar integração"}</SubmitButton>
        </DialogFooter>
      </form>
    </Form>
  )
}
