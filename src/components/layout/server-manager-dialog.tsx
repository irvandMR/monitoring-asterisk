"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useServerContext, AsteriskServer } from "@/lib/contexts/server-context";
import { Server, Plus, Edit2, Trash2, Check, X, Loader2, AlertCircle } from "lucide-react";

interface ServerManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ServerManagerDialog({ open, onOpenChange }: ServerManagerDialogProps) {
  const { servers, activeServer, setActiveServer, addServer, updateServer, deleteServer } = useServerContext();
  
  // Tab/Mode: "list" | "add" | "edit"
  const [editingServerId, setEditingServerId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formIp, setFormIp] = useState("");
  const [formPort, setFormPort] = useState(5038);
  const [formAmiUser, setFormAmiUser] = useState("");
  const [formAmiPass, setFormAmiPass] = useState("");
  const [formSshUser, setFormSshUser] = useState("");
  const [formSshPass, setFormSshPass] = useState("");

  // Reset when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setEditingServerId(null);
      setIsAdding(false);
      setErrorMsg("");
    }
  }, [open]);

  const handleStartEdit = (server: AsteriskServer) => {
    setEditingServerId(server.id);
    setFormName(server.name);
    setFormIp(server.ip || server.id);
    setFormPort(server.port || 5038);
    setFormAmiUser(server.amiUsername || "");
    setFormAmiPass(server.amiPassword || "");
    setFormSshUser(server.sshUsername || "");
    setFormSshPass(server.sshPassword || "");
    setIsAdding(false);
    setErrorMsg("");
  };

  const handleStartAdd = () => {
    setIsAdding(true);
    setEditingServerId(null);
    setFormName("");
    setFormIp("");
    setFormPort(5038);
    setFormAmiUser("");
    setFormAmiPass("");
    setFormSshUser("");
    setFormSshPass("");
    setErrorMsg("");
  };

  const handleCancelEdit = () => {
    setEditingServerId(null);
    setIsAdding(false);
    setErrorMsg("");
  };

  const handleSaveEdit = async () => {
    if (!editingServerId) return;
    if (!formName.trim() || !formIp.trim()) {
      setErrorMsg("Nama server dan IP address wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const res = await updateServer(editingServerId, {
      name: formName.trim(),
      ip: formIp.trim(),
      port: Number(formPort) || 5038,
      amiUsername: formAmiUser.trim() || undefined,
      amiPassword: formAmiPass || undefined,
      sshUsername: formSshUser.trim() || undefined,
      sshPassword: formSshPass || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Gagal menyimpan perubahan");
    } else {
      setEditingServerId(null);
    }
  };

  const handleSaveNew = async () => {
    if (!formName.trim() || !formIp.trim()) {
      setErrorMsg("Nama server dan IP address wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const res = await addServer({
      name: formName.trim(),
      ip: formIp.trim(),
      port: Number(formPort) || 5038,
      amiUsername: formAmiUser.trim() || undefined,
      amiPassword: formAmiPass || undefined,
      sshUsername: formSshUser.trim() || undefined,
      sshPassword: formSshPass || undefined,
    });

    setIsSubmitting(false);

    if (!res.success) {
      setErrorMsg(res.error || "Gagal menambahkan server");
    } else {
      setIsAdding(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Hapus server "${name}"?`)) {
      setIsSubmitting(true);
      const res = await deleteServer(id);
      setIsSubmitting(false);
      if (!res.success) {
        setErrorMsg(res.error || "Gagal menghapus server");
      }
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border max-h-[85vh] flex flex-col p-6">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-5 w-5 text-emerald-400" />
              <DialogTitle className="text-lg font-bold text-foreground">
                Kelola Server Asterisk
              </DialogTitle>
            </div>
            {!isAdding && !editingServerId && (
              <Button size="sm" onClick={handleStartAdd} className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5">
                <Plus className="h-4 w-4" />
                Tambah Server
              </Button>
            )}
          </div>
          <DialogDescription className="text-xs text-muted-foreground mt-1">
            Daftar server PBX yang terhubung. Anda dapat mengubah nama, IP Address, port, dan role server di sini.
          </DialogDescription>
        </DialogHeader>

        {errorMsg && (
          <div className="bg-destructive/15 border border-destructive/30 rounded-lg p-3 my-2 flex items-center gap-2 text-destructive text-sm font-mono">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto mt-4 space-y-3 pr-1">
          {/* Form: Add or Edit */}
          {(isAdding || editingServerId) && (
            <div className="bg-secondary/40 border border-emerald-500/30 rounded-xl p-4 space-y-4 mb-4">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <h4 className="font-semibold text-sm text-foreground flex items-center gap-2">
                  <Edit2 className="h-4 w-4 text-emerald-400" />
                  {isAdding ? "Tambah Server Baru" : "Edit IP & Pengaturan Server"}
                </h4>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleCancelEdit}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nama Server</Label>
                  <Input
                    placeholder="Misal: PBX-Primary"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="h-9"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">IP Address</Label>
                  <Input
                    placeholder="Misal: 192.168.10.11"
                    value={formIp}
                    onChange={(e) => setFormIp(e.target.value)}
                    className="h-9 font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">AMI Port (Default: 5038)</Label>
                  <Input
                    type="number"
                    value={formPort}
                    onChange={(e) => setFormPort(Number(e.target.value))}
                    className="h-9 font-mono"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                <div className="space-y-1.5">
                  <Label className="text-xs">AMI Username</Label>
                  <Input
                    placeholder="Username AMI"
                    value={formAmiUser}
                    onChange={(e) => setFormAmiUser(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">AMI Password</Label>
                  <Input
                    type="password"
                    placeholder="Password AMI"
                    value={formAmiPass}
                    onChange={(e) => setFormAmiPass(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">SSH Username</Label>
                  <Input
                    placeholder="Misal: root"
                    value={formSshUser}
                    onChange={(e) => setFormSshUser(e.target.value)}
                    className="h-9"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">SSH Password</Label>
                  <Input
                    type="password"
                    placeholder="Password SSH"
                    value={formSshPass}
                    onChange={(e) => setFormSshPass(e.target.value)}
                    className="h-9"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={handleCancelEdit} disabled={isSubmitting}>
                  Batal
                </Button>
                <Button
                  size="sm"
                  onClick={isAdding ? handleSaveNew : handleSaveEdit}
                  disabled={isSubmitting}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Check className="h-4 w-4" />
                  )}
                  {isAdding ? "Simpan Server" : "Simpan Perubahan"}
                </Button>
              </div>
            </div>
          )}

          {/* Server List */}
          {servers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              Belum ada server yang terdaftar. Klik tombol Tambah Server.
            </div>
          ) : (
            servers.map((s) => {
              const isSelected = activeServer?.id === s.id;
              const isEditingThis = editingServerId === s.id;

              return (
                <div
                  key={s.id}
                  className={`border rounded-xl p-3.5 flex items-center justify-between transition-all ${
                    isSelected
                      ? "border-emerald-500/50 bg-emerald-500/5"
                      : "border-border bg-card/60 hover:bg-secondary/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary text-foreground">
                      <Server className="h-4 w-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">{s.name}</span>
                        {isSelected && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                            Aktif
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono mt-0.5">
                        <span>IP: {s.ip || s.id}</span>
                        <span>•</span>
                        <span>Port: {s.port || 5038}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isSelected && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setActiveServer(s)}
                        className="text-xs h-8 text-muted-foreground hover:text-foreground"
                      >
                        Pilih
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleStartEdit(s)}
                      disabled={isEditingThis}
                      title="Edit Nama / IP Server"
                      className="h-8 w-8 text-muted-foreground hover:text-emerald-400"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(s.id, s.name)}
                      disabled={servers.length <= 1}
                      title={servers.length <= 1 ? "Minimal harus ada 1 server" : "Hapus Server"}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
