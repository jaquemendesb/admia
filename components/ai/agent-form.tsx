"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createAgentSchema, updateAgentSchema, AGENT_ROLE_LABELS, AGENT_ROLES_ARRAY } from "@/lib/validation/agents"
import type { CreateAgentInput, UpdateAgentInput } from "@/lib/validation/agents"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"

interface AgentFormProps {
  defaultValues?: Partial<CreateAgentInput>
  isEditing?: boolean
  onSubmit: (data: CreateAgentInput | UpdateAgentInput) => Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function AgentForm({ defaultValues, isEditing, onSubmit, onCancel, isSubmitting }: AgentFormProps) {
  const schema = isEditing ? updateAgentSchema : createAgentSchema
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      agent_role: undefined,
      model_alias: "",
      prompt_template: "",
      active: true,
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
      <form onSubmit={form.handleSubmit((data) => onSubmit(data as CreateAgentInput))} className="space-y-4">
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
                    placeholder="Agente de Roteamento"
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
                  <Input {...field} placeholder="agente-de-roteamento" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="agent_role"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Papel</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o papel" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {AGENT_ROLES_ARRAY.map((role) => (
                      <SelectItem key={role} value={role}>{AGENT_ROLE_LABELS[role]}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="model_alias"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alias do modelo</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="gpt-4o-mini" />
                </FormControl>
                <FormDescription className="text-xs">Alias configurado no LiteLLM.</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="prompt_template"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Template de prompt</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={8}
                  placeholder="Você é um agente responsável por..."
                  className="font-mono text-sm resize-y"
                />
              </FormControl>
              <FormDescription>Template base injetado antes do system_prompt da persona.</FormDescription>
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
              <FormLabel className="cursor-pointer">Ativo</FormLabel>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Salvando..." : isEditing ? "Salvar alterações" : "Criar agente"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
