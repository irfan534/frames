import type { Metadata } from "next";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
};

export const metadata: Metadata = {
  title: "Contact Messages"
};

export default async function ContactMessagesPage() {
  const supabase = createSupabaseAdminClient();
  let messages: ContactMessage[] = [];

  if (supabase) {
    const { data } = await supabase
      .from("contact_messages")
      .select("id,name,email,message,created_at")
      .order("created_at", { ascending: false });

    messages = (data || []) as ContactMessage[];
  }

  return (
    <div className="p-4 lg:p-8">
      <div>
        <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
          Messages
        </p>
        <h1 className="mt-2 font-display text-4xl font-bold">Contact messages</h1>
      </div>

      <div className="mt-7 rounded-lg border border-border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {messages.map((message) => (
              <TableRow key={message.id}>
                <TableCell className="font-medium">{message.name}</TableCell>
                <TableCell>{message.email}</TableCell>
                <TableCell className="max-w-xl whitespace-pre-wrap">{message.message}</TableCell>
                <TableCell>{new Date(message.created_at).toLocaleString("en-IN")}</TableCell>
              </TableRow>
            ))}
            {messages.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-optical-muted">
                  No contact messages yet.
                </TableCell>
              </TableRow>
            ) : null}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
