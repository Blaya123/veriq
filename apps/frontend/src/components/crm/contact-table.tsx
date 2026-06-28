"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Phone,
  MoreHorizontal,
  Trash2,
  Edit3,
  MessageSquare,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ContactRow {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source?: string;
  avatarUrl?: string;
  createdAt: string;
  _count?: { deals?: number; conversations?: number; activities?: number };
}

interface ContactTableProps {
  contacts: ContactRow[];
  onDelete?: (id: string) => void;
  selected?: Set<string>;
  onSelectChange?: (id: string, selected: boolean) => void;
}

export function ContactTable({
  contacts,
  onDelete,
  selected,
  onSelectChange,
}: ContactTableProps) {
  const router = useRouter();

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200 dark:border-neutral-700">
            {onSelectChange && <th className="w-10 px-3 py-3 text-left" />}
            <th className="px-3 py-3 text-left font-medium text-neutral-500">
              Name
            </th>
            <th className="px-3 py-3 text-left font-medium text-neutral-500">
              Email
            </th>
            <th className="px-3 py-3 text-left font-medium text-neutral-500">
              Phone
            </th>
            <th className="px-3 py-3 text-left font-medium text-neutral-500">
              Source
            </th>
            <th className="px-3 py-3 text-center font-medium text-neutral-500">
              Deals
            </th>
            <th className="px-3 py-3 text-left font-medium text-neutral-500">
              Created
            </th>
            <th className="w-10 px-3 py-3" />
          </tr>
        </thead>
        <tbody>
          {contacts.map((contact) => (
            <tr
              key={contact.id}
              className="border-b border-neutral-100 transition-colors hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900/50"
            >
              {onSelectChange && (
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    checked={selected?.has(contact.id)}
                    onChange={(e) =>
                      onSelectChange(contact.id, e.target.checked)
                    }
                    className="h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  />
                </td>
              )}
              <td className="px-3 py-3">
                <button
                  onClick={() =>
                    router.push(`/dashboard/contacts/${contact.id}`)
                  }
                  className="flex items-center gap-2"
                >
                  <Avatar
                    fallback={contact.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                    size="sm"
                  />
                  <span className="font-medium text-neutral-900 hover:text-primary-600 dark:text-neutral-50">
                    {contact.name}
                  </span>
                </button>
              </td>
              <td className="px-3 py-3">
                {contact.email && (
                  <a
                    href={`mailto:${contact.email}`}
                    className="flex items-center gap-1.5 text-neutral-600 hover:text-primary-600 dark:text-neutral-400"
                  >
                    <Mail className="h-3.5 w-3.5" />
                    {contact.email}
                  </a>
                )}
              </td>
              <td className="px-3 py-3">
                {contact.phone && (
                  <span className="flex items-center gap-1.5 text-neutral-600 dark:text-neutral-400">
                    <Phone className="h-3.5 w-3.5" />
                    {contact.phone}
                  </span>
                )}
              </td>
              <td className="px-3 py-3">
                <Badge variant="outline" size="sm">
                  {contact.source || "OTHER"}
                </Badge>
              </td>
              <td className="px-3 py-3 text-center">
                <span className="font-medium text-neutral-900 dark:text-neutral-50">
                  {contact._count?.deals ?? 0}
                </span>
              </td>
              <td className="px-3 py-3 text-neutral-500">
                {new Date(contact.createdAt).toLocaleDateString()}
              </td>
              <td className="px-3 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-40">
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(`/dashboard/contacts/${contact.id}`)
                      }
                    >
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() =>
                        router.push(
                          `/dashboard/inbox?contactId=${contact.id}`
                        )
                      }
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Message
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDelete?.(contact.id)}
                      className="text-error-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
          {contacts.length === 0 && (
            <tr>
              <td
                colSpan={8}
                className="py-12 text-center text-sm text-neutral-400"
              >
                No contacts found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
