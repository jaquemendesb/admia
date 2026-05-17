"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createPersonaSchema, updatePersonaSchema } from "@/lib/validation/personas"
import type { CreatePersonaInput, UpdatePersonaInput } from "@/lib/validation/personas"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface PersonaFormProps {
  defaultValues?: Partial<CreatePersonaInput>
  isEditing?: boolean
  onSubmit: (data: CreatePersonaInput | UpdatePersonaInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function PersonaForm({ defaultValues, isEditing, onSubmit, onCancel, isSubmitting }: PersonaFormProps) {
  const schema = isEditing ? updatePersonaSchema : createPersonaSchema
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      system_prompt: "",
      tone: "",
      language: "pt-BR",
      active: true,
      is_default: false,
      ...defaultValues,
    },
  })

  function handleNameChange(value: string) {
    if (!isEditing) {
      const slug = value
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      form.setValue("slug", slug)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreatePersonaInput))} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    onChange={(e) => { field.onChange(e); handleNameChange(e.target.value) }}
                    placeholder="Assistente de Vendas"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="slug"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Slug</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="assistente-de-vendas" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} placeholder="Descrição breve da persona" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="system_prompt"
          render={({ field }) => (
            <FormItem>
              <FormLabel>System Prompt</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={8}
                  placeholder="Você é um assistente especializado em..."
                  className="font-mono text-sm resize-y"
                />
              </FormControl>
              <FormDescription>Instruções de comportamento enviadas ao modelo antes da conversa.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="tone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tom</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} placeholder="amigável, profissional, direto..." />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Idioma</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="pt-BR" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-6">
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
          <FormField
            control={form.control}
            name="is_default"
            render={({ field }) => (
              <FormItem className="flex items-center gap-2 space-y-0">
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
                <div>
                  <FormLabel className="cursor-pointer">Padrão</FormLabel>
                  <FormDescription className="text-xs">Usada quando nenhuma persona específica for selecionada.</FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar persona"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
