import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Save, Loader2, Sparkles, NotebookPen } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { API_URL } from '@/config';
import { motion, AnimatePresence } from 'framer-motion';

const NoteColors = [
  { name: 'Sunset', class: 'bg-gradient-to-br from-orange-200 to-rose-200 border-rose-300' },
  { name: 'Ocean', class: 'bg-gradient-to-br from-cyan-200 to-blue-200 border-blue-300' },
  { name: 'Emerald', class: 'bg-gradient-to-br from-emerald-200 to-teal-200 border-teal-300' },
  { name: 'Lavender', class: 'bg-gradient-to-br from-violet-200 to-purple-200 border-purple-300' },
  { name: 'Lemon', class: 'bg-gradient-to-br from-yellow-200 to-amber-200 border-amber-300' },
  { name: 'Cloud', class: 'bg-gradient-to-br from-slate-100 to-slate-200 border-slate-300' },
];

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [newNote, setNewNote] = useState({ title: '', content: '', color: NoteColors[0].class });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/notes`);
      if (!response.ok) throw new Error('Failed to fetch notes');
      const data = await response.json();
      setNotes(data);
    } catch (error) {
      console.error(error);
      toast.error("Could not load notes");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNote = async () => {
    if (!newNote.title.trim() && !newNote.content.trim()) {
      toast.error("Note cannot be empty");
      return;
    }

    try {
      const url = editingNote 
        ? `${API_URL}/api/notes/${editingNote.id}` 
        : `${API_URL}/api/notes`;
      
      const method = editingNote ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) throw new Error('Failed to save note');
      
      await fetchNotes();
      toast.success(editingNote ? "Note updated" : "Note created");
      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save note");
    }
  };

  const deleteNote = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/notes/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete note');
      setNotes(notes.filter(n => n.id !== id));
      toast.success("Note deleted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete note");
    }
  };

  const startEditing = (note) => {
    setEditingNote(note);
    setNewNote({ title: note.title, content: note.content, color: note.color || NoteColors[0].class });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setNewNote({ title: '', content: '', color: NoteColors[0].class });
    setEditingNote(null);
  };

  const filteredNotes = notes ? notes.filter(note => 
    (note.title || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (note.content || '').toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ 
            rotateY: [0, 180, 360],
            scale: [1, 1.1, 1],
            y: [0, -10, 0]
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <NotebookPen className="h-16 w-16 text-primary" />
        </motion.div>
        <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 animate-pulse">
          Crafting your workspace...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 perspective-1000 overflow-x-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.header 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6 bg-white/40 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl"
        >
          <div className="flex items-center gap-4">
            <motion.div 
              whileHover={{ rotate: 10, scale: 1.1 }}
              className="bg-primary/10 p-3 rounded-2xl"
            >
              <Sparkles className="h-8 w-8 text-primary" />
            </motion.div>
            <div>
              <h1 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                Lumina Notes
              </h1>
              <p className="text-slate-500 font-medium">Your thoughts, in full dimension.</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-72 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Find a thought..." 
                className="pl-11 bg-white/60 border-slate-200 rounded-2xl h-12 focus:ring-primary focus:border-primary transition-all shadow-sm group-hover:shadow-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button className="h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-primary/20 font-bold bg-gradient-to-r from-primary to-indigo-600 hover:from-primary hover:to-indigo-700 transition-all">
                    <Plus className="h-5 w-5" />
                    New
                  </Button>
                </motion.div>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px] rounded-3xl border-none shadow-2xl bg-white/95 backdrop-blur-xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-slate-800">
                    {editingNote ? 'Refine Thought' : 'Capture Thought'}
                  </DialogTitle>
                </DialogHeader>
                <div className="grid gap-6 py-6">
                  <div className="space-y-2">
                    <Input 
                      placeholder="Give it a name..." 
                      value={newNote.title}
                      onChange={(e) => setNewNote({...newNote, title: e.target.value})}
                      className="text-xl font-bold border-none focus-visible:ring-0 px-0 bg-transparent placeholder:text-slate-300"
                    />
                    <div className="h-px bg-gradient-to-r from-primary/30 to-transparent" />
                  </div>
                  <Textarea 
                    placeholder="Let it flow..." 
                    value={newNote.content}
                    onChange={(e) => setNewNote({...newNote, content: e.target.value})}
                    className="min-h-[250px] border-none focus-visible:ring-0 px-0 resize-none bg-transparent text-lg text-slate-600 placeholder:text-slate-300"
                  />
                  <div className="flex flex-wrap gap-2 pt-2">
                    {NoteColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setNewNote({...newNote, color: color.class})}
                        className={`w-8 h-8 rounded-full transition-all ${color.class} border-2 ${newNote.color === color.class ? 'scale-125 border-slate-600 shadow-md' : 'border-transparent hover:scale-110'}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                  <Button onClick={handleSaveNote} className="rounded-xl px-8 font-bold bg-primary shadow-lg shadow-primary/20">
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </motion.header>

        <motion.div 
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note, index) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, scale: 0.8, rotateX: -15, y: 50 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0, y: 0 }}
                  exit={{ opacity: 0, scale: 0.5, rotateY: 45 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 260,
                    damping: 20,
                    delay: index * 0.05 
                  }}
                  whileHover={{ 
                    y: -10,
                    rotateX: 5,
                    rotateY: -5,
                    scale: 1.02,
                    zIndex: 10,
                    transition: { duration: 0.2 }
                  }}
                  className="perspective-1000"
                >
                  <Card 
                    className={`h-full group relative overflow-hidden rounded-[2rem] border-2 shadow-xl hover:shadow-2xl transition-all duration-300 ${note.color || NoteColors[0].class} cursor-default`}
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-white/30" />
                    <CardHeader className="pb-3 pt-6 px-6">
                      <div className="flex justify-between items-start">
                        <CardTitle className="text-xl font-black text-slate-800 line-clamp-2 leading-tight">
                          {note.title || 'Untitled'}
                        </CardTitle>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl bg-white/60 hover:bg-white backdrop-blur-sm border-none shadow-sm" 
                            onClick={(e) => { e.stopPropagation(); startEditing(note); }}
                          >
                            <Edit3 className="h-4 w-4 text-slate-700" />
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl bg-rose-500 hover:bg-rose-600 border-none shadow-sm"
                            onClick={(e) => { e.stopPropagation(); deleteNote(note.id); }}
                          >
                            <Trash2 className="h-4 w-4 text-white" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription className="text-slate-500 font-bold text-xs uppercase tracking-widest mt-1">
                        {new Date(note.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-8">
                      <p className="text-slate-700 font-medium text-base line-clamp-6 whitespace-pre-wrap leading-relaxed opacity-90">
                        {note.content}
                      </p>
                    </CardContent>
                    <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/10 blur-3xl rounded-full -mr-8 -mb-8 pointer-events-none" />
                  </Card>
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-full flex flex-col items-center justify-center py-32 text-center"
              >
                <div className="bg-white rounded-[3rem] p-12 shadow-2xl border-4 border-slate-100 relative group overflow-hidden">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 4 }}
                  >
                    <Search className="h-20 w-20 text-slate-200" />
                  </motion.div>
                  <div className="mt-6">
                    <h3 className="text-2xl font-black text-slate-800">Void Detected</h3>
                    <p className="text-slate-500 font-medium mt-2">No thoughts match your criteria.</p>
                  </div>
                  <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
      `}</style>
    </div>
  );
};

export default Index;
