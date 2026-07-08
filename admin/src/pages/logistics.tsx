import { useState } from 'react'
import { MoreHorizontal, Plus, Truck } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { LoadingBlock, ErrorBlock } from '@/components/data-state'
import { useAsyncData } from '@/hooks/use-async-data'
import {
  createLogisticsCompany,
  deleteLogisticsCompany,
  fetchLogisticsCompanies,
  updateLogisticsCompany,
  type LogisticsCompany,
  type LogisticsCompanyInput,
} from '@/lib/api'
import { toast } from 'sonner'

const emptyForm: LogisticsCompanyInput = {
  name: '',
  coverage: '',
  description: '',
  whatsapp: '',
  phone: '',
  email: '',
  website: '',
  active: true,
}

export function LogisticsPage() {
  const { data: companies, loading, error, reload } = useAsyncData(fetchLogisticsCompanies)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<LogisticsCompany | null>(null)
  const [form, setForm] = useState<LogisticsCompanyInput>(emptyForm)
  const [saving, setSaving] = useState(false)

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (company: LogisticsCompany) => {
    setEditing(company)
    setForm({
      name: company.name,
      coverage: company.coverage,
      description: company.description,
      whatsapp: company.whatsapp,
      phone: company.phone,
      email: company.email,
      website: company.website,
      active: company.active,
    })
    setDialogOpen(true)
  }

  const handleSave = async () => {
    if (!form.name.trim() || !form.whatsapp.trim()) {
      toast.error('Name and WhatsApp number are required.')
      return
    }

    setSaving(true)
    try {
      if (editing) {
        await updateLogisticsCompany(editing.id, form)
        toast.success(`${form.name} updated.`)
      } else {
        await createLogisticsCompany(form)
        toast.success(`${form.name} added.`)
      }
      setDialogOpen(false)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save logistics company.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (company: LogisticsCompany) => {
    if (!window.confirm(`Remove ${company.name}? Sellers will no longer be able to share orders with them.`)) {
      return
    }
    try {
      await deleteLogisticsCompany(company.id)
      toast.success(`${company.name} removed.`)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove logistics company.')
    }
  }

  const handleToggleActive = async (company: LogisticsCompany, active: boolean) => {
    try {
      await updateLogisticsCompany(company.id, { active })
      toast.success(`${company.name} is now ${active ? 'active' : 'inactive'}.`)
      reload()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update status.')
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Logistics companies</CardTitle>
            <CardDescription>
              {companies?.length ?? 0} partner{companies?.length === 1 ? '' : 's'} sellers can share orders with
            </CardDescription>
          </div>
          <Button onClick={openCreate}>
            <Plus className="size-4" />
            Add company
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <LoadingBlock rows={4} />
          ) : error ? (
            <ErrorBlock message={error} onRetry={reload} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Coverage</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {(companies ?? []).map((company) => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="size-8">
                          <AvatarFallback className="text-xs">
                            <Truck className="size-4" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{company.name}</div>
                          <div className="text-xs text-muted-foreground">{company.description}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{company.coverage || '—'}</TableCell>
                    <TableCell>{company.whatsapp || '—'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={company.active}
                          onCheckedChange={(checked) => handleToggleActive(company, checked)}
                        />
                        <Badge variant={company.active ? 'default' : 'secondary'}>
                          {company.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="size-8">
                            <MoreHorizontal className="size-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(company)}>Edit</DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDelete(company)}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
                {(companies ?? []).length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                      No logistics companies yet. Add one to make it available to sellers.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit logistics company' : 'Add logistics company'}</DialogTitle>
            <DialogDescription>
              Active companies with a WhatsApp number appear in every seller&rsquo;s Logistics tab and can be used to
              share orders.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="GIG Logistics"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="whatsapp">WhatsApp number</Label>
              <Input
                id="whatsapp"
                value={form.whatsapp}
                onChange={(e) => setForm((f) => ({ ...f, whatsapp: e.target.value }))}
                placeholder="08012345678 or https://wa.me/234..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="coverage">Coverage area</Label>
              <Input
                id="coverage"
                value={form.coverage}
                onChange={(e) => setForm((f) => ({ ...f, coverage: e.target.value }))}
                placeholder="Nationwide, same-day in major cities"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Pickup and delivery for parcels of any size..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email (optional)</Label>
                <Input
                  id="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="website">Website (optional)</Label>
              <Input
                id="website"
                value={form.website}
                onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="active"
                checked={form.active}
                onCheckedChange={(checked) => setForm((f) => ({ ...f, active: checked }))}
              />
              <Label htmlFor="active">Active (visible to sellers)</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? 'Saving…' : editing ? 'Save changes' : 'Add company'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
