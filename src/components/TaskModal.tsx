import React, { useState, useEffect } from 'react';
import { Task, Comment } from '../types';
import { db, auth } from '../firebase/config';
import { collection, onSnapshot, query, orderBy, addDoc, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { 
  X, AlignLeft, Calendar, User, Tag, 
  MessageSquare, Trash2, Clock, Send 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

interface TaskModalProps {
  task: Task;
  onClose: () => void;
  boardId: string;
}

export default function TaskModal({ task, onClose, boardId }: TaskModalProps) {
  const [description, setDescription] = useState(task.description || '');
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isEditingDesc, setIsEditingDesc] = useState(false);

  useEffect(() => {
    const q = query(
      collection(db, 'boards', boardId, 'tasks', task.id, 'comments'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedComments = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Comment[];
      setComments(fetchedComments);
    });

    return () => unsubscribe();
  }, [boardId, task.id]);

  const handleUpdateDescription = async () => {
    try {
      await updateDoc(doc(db, 'boards', boardId, 'tasks', task.id), {
        description: description,
        updatedAt: Date.now()
      });
      setIsEditingDesc(false);
    } catch (error) {
      console.error("Tavsifni yangilashda xatolik:", error);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !auth.currentUser) return;

    try {
      await addDoc(collection(db, 'boards', boardId, 'tasks', task.id, 'comments'), {
        taskId: task.id,
        userId: auth.currentUser.uid,
        text: newComment,
        createdAt: Date.now()
      });
      setNewComment('');
    } catch (error) {
      console.error("Izoh qoldirishda xatolik:", error);
    }
  };

  const handleDeleteTask = async () => {
    if (!window.confirm("Haqiqatan ham bu vazifani o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'boards', boardId, 'tasks', task.id));
      onClose();
    } catch (error) {
      console.error("Vazifani o'chirishda xatolik:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-natural-text/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div 
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl flex flex-col max-h-[90vh] border border-natural-border"
      >
        {/* Modal Header */}
        <div className="p-8 border-b border-natural-bg flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-natural-text mb-1">{task.title}</h2>
            <p className="text-xs text-natural-text-muted">
              <span className="font-semibold">Ustun:</span> {task.columnId}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={handleDeleteTask}
              className="p-2 hover:bg-red-50 text-red-300 hover:text-red-600 rounded-full transition-all"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button 
              onClick={onClose}
              className="p-2 hover:bg-natural-sidebar text-natural-text-muted hover:text-natural-text rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-10 kanban-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Left Column */}
            <div className="md:col-span-2 space-y-10">
              {/* Description */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <AlignLeft className="w-5 h-5 text-natural-accent" />
                  <h3 className="font-bold text-natural-text">Tavsif</h3>
                </div>
                {isEditingDesc ? (
                  <div className="space-y-3">
                    <textarea 
                      autoFocus
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="w-full min-h-[140px] p-5 bg-natural-input border-none rounded-2xl focus:ring-2 focus:ring-natural-accent outline-none transition-all text-sm text-natural-text"
                      placeholder="Batafsil ma'lumot kiriting..."
                    />
                    <div className="flex gap-2">
                      <button 
                        onClick={handleUpdateDescription}
                        className="px-6 py-2 bg-natural-accent text-white rounded-full text-sm font-bold shadow-sm hover:bg-natural-accent-hover transition-all"
                      >
                        Saqlash
                      </button>
                      <button 
                        onClick={() => { setDescription(task.description); setIsEditingDesc(false); }}
                        className="px-6 py-2 bg-natural-sidebar text-natural-text-muted rounded-full text-sm font-bold hover:bg-natural-border transition-all"
                      >
                        Bekor qilish
                      </button>
                    </div>
                  </div>
                ) : (
                  <div 
                    onClick={() => setIsEditingDesc(true)}
                    className="p-5 bg-natural-input/50 hover:bg-natural-input rounded-[2rem] cursor-pointer min-h-[100px] group transition-all"
                  >
                    {description ? (
                      <p className="text-sm text-natural-text leading-relaxed whitespace-pre-wrap">{description}</p>
                    ) : (
                      <span className="text-sm text-natural-text-muted group-hover:text-natural-text transition-colors">Batafsil ma'lumot qo'shish...</span>
                    )}
                  </div>
                )}
              </section>

              {/* Comments */}
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquare className="w-5 h-5 text-natural-accent" />
                  <h3 className="font-bold text-natural-text">Izohlar</h3>
                </div>

                <form onSubmit={handleAddComment} className="flex gap-3 mb-8">
                  <div className="w-9 h-9 rounded-full bg-natural-accent/10 border border-natural-accent/20 flex items-center justify-center text-xs font-bold text-natural-accent flex-shrink-0">
                    {auth.currentUser?.displayName?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 relative">
                    <input 
                      type="text"
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Izoh qoldiring..."
                      className="w-full pl-5 pr-12 py-2.5 bg-natural-input border-none rounded-full focus:ring-2 focus:ring-natural-accent outline-none text-sm text-natural-text"
                    />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-natural-accent hover:bg-natural-accent/10 rounded-full transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </form>

                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-9 h-9 rounded-full bg-natural-sidebar border border-natural-border flex items-center justify-center text-xs font-bold text-natural-text-muted flex-shrink-0">
                        {comment.userId.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="font-bold text-sm text-natural-text">Foydalanuvchi</span>
                          <span className="text-[10px] text-natural-text-muted/60">{format(new Date(comment.createdAt), 'HH:mm dd.MM')}</span>
                        </div>
                        <div className="p-4 bg-white rounded-3xl rounded-tl-none border border-natural-border shadow-sm">
                          <p className="text-sm text-natural-text leading-relaxed">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-8">
              <div>
                <h4 className="text-[10px] font-bold text-natural-accent uppercase tracking-widest mb-4">Holat</h4>
                <div className="space-y-3 bg-natural-input/30 p-4 rounded-3xl border border-natural-border/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-natural-text-muted">
                      <Tag className="w-4 h-4" />
                      <span className="text-xs font-semibold">Prioritet</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      task.priority === 'high' ? 'bg-red-50 text-red-600' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600' :
                      'bg-green-50 text-green-600'
                    }`}>
                      {task.priority === 'low' ? 'Past' : task.priority === 'medium' ? "O'rta" : 'Yuqori'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-natural-text-muted">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-semibold">Muddat</span>
                    </div>
                    <span className="text-xs font-bold text-natural-text">
                      {task.dueDate ? format(new Date(task.dueDate), 'dd.MM.yyyy') : format(new Date(task.createdAt), 'dd.MM.yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-natural-text-muted">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-semibold">Mas'ul</span>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-natural-accent/10 border border-natural-accent/20 flex items-center justify-center text-xs font-bold text-natural-accent">
                      {task.ownerId.charAt(0).toUpperCase()}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] font-bold text-natural-accent uppercase tracking-widest mb-4">Boshqaruv</h4>
                <div className="space-y-4">
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-natural-text-muted bg-natural-sidebar hover:bg-natural-border rounded-xl transition-all shadow-sm">
                    <Clock className="w-4 h-4" />
                    Amallar tarixi
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-natural-text-muted bg-natural-sidebar hover:bg-natural-border rounded-xl transition-all shadow-sm">
                    <Send className="w-4 h-4" />
                    Havola ulashish
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
