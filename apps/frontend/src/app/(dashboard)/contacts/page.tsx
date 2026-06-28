"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Search, Filter, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ContactTable } from "@/components/crm/contact-table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input as FormInput } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/toast";

interface ContactData {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  avatarUrl?: string;
  createdAt: string;
  _count?: { deals?: number; conversations?: number; activities?: number };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [newContact, setNewContact] = useState({ name: "", email: "", phone: "" });

  const loadContacts = useCallback(async () => {
    try {
      const params = search ? `?search=${encodeURIComponent(search)}` : "";
      const data = await api.get<ContactData[]>(`/contacts${params}`);
      setContacts(data);
    } catch (err) {
      console.error("Failed to load contacts", err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAddContact = async () => {
    if (!newContact.name) return;
    try {
      await api.post("/contacts", newContact);
      setShowAddDialog(false);
      setNewContact({ name: "", email: "", phone: "" });
      toast.success("Contact created");
      loadContacts();
    } catch (err: any) {
      toast.error(err?.message || "Failed to create contact");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/contacts/${id}`);
      toast.success("Contact deleted");
      loadContacts();
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete contact");
    }
  };

  const handleBulkDelete = async () => {
    for (const id of selected) {
      await api.delete(`/contacts/${id}`);
    }
    setSelected(new Set());
    toast.success(`${selected.size} contacts deleted`);
    loadContacts();
  };

  const toggleSelect = (id: string, checked: boolean) => {
    const next = new Set(selected);
    if (checked) next.add(id);
    else next.delete(id);
    setSelected(next);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Contacts</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Manage your contacts and relationships
          </p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="mr-1.5 h-4 w-4" />
          Add Contact
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="mr-1.5 h-4 w-4" />
          Filter
        </Button>
        {selected.size > 0 && (
          <Button variant="danger" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-1.5 h-4 w-4" />
            Delete ({selected.size})
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <ContactTable
            contacts={contacts}
            onDelete={handleDelete}
            selected={selected}
            onSelectChange={toggleSelect}
          />
        </CardContent>
      </Card>

      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Contact</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <FormInput
                id="name"
                value={newContact.name}
                onChange={(e) =>
                  setNewContact({ ...newContact, name: e.target.value })
                }
                placeholder="Contact name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <FormInput
                id="email"
                type="email"
                value={newContact.email}
                onChange={(e) =>
                  setNewContact({ ...newContact, email: e.target.value })
                }
                placeholder="Email address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <FormInput
                id="phone"
                value={newContact.phone}
                onChange={(e) =>
                  setNewContact({ ...newContact, phone: e.target.value })
                }
                placeholder="Phone number"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setShowAddDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddContact}>Create Contact</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Card({ className, children, ...props }: any) {
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900 ${className || ""}`}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }: any) {
  return (
    <div className={`${className || ""}`} {...props}>
      {children}
    </div>
  );
}
