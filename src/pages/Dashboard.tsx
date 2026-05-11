import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import { db, auth } from '../firebase/config';
import { collection, onSnapshot, query, where, addDoc, orderBy } from 'firebase/firestore';
import { Board } from '../types';
import { Layout, Plus, Search, LogOut, ChevronRight, Users, Clock } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { state: authState } = useAuth();
  const { state: globalState, dispatch: globalDispatch } = useGlobal();
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showNewBoardModal, setShowNewBoardModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (!authState.user) return;

    const q = query(
      collection(db, 'boards'),
      where('members', 'array-contains', authState.user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const boards = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Board[];
      globalDispatch({ type: 'SET_BOARDS', payload: boards });
    });

    return () => unsubscribe();
  }, [authState.user, globalDispatch]);

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim() || !authState.user) return;

    try {
      const boardData = {
        title: newBoardTitle,
        ownerId: authState.user.uid,
        members: [authState.user.uid],
        columnOrder: [],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      
      const docRef = await addDoc(collection(db, 'boards'), boardData);
      
      // Create default columns
      const columns = ['Rejada', 'Jarayonda', 'Bajarildi'];
      for (let i = 0; i < columns.length; i++) {
        await addDoc(collection(db, 'boards', docRef.id, 'columns'), {
          title: columns[i],
          boardId: docRef.id,
          order: i,
          taskOrder: []
        });
      }

      setNewBoardTitle('');
      setShowNewBoardModal(false);
      navigate(`/board/${docRef.id}`);
    } catch (error) {
      console.error("Doska yaratishda xatolik:", error);
    }
  };

  const filteredBoards = globalState.boards.filter(board => 
    board.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-natural-bg overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-natural-sidebar border-r border-natural-border flex flex-col flex-shrink-0">
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-natural-accent rounded-xl flex items-center justify-center text-white shadow-sm">
            <Layout className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl tracking-tight text-natural-text-muted">Vazifa.uz</span>
        </div>

        <nav className="flex-1 p-4 flex flex-col gap-1 overflow-y-auto">
          <div className="px-3 mb-2">
            <span className="text-[10px] font-bold text-natural-accent uppercase tracking-widest">Asosiy</span>
          </div>
          <button className="flex items-center gap-3 px-3 py-2 bg-natural-border rounded-xl text-natural-text font-medium transition-all group">
            <Layout className="w-4 h-4" />
            Doskalarim
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-natural-text-muted hover:bg-natural-border/50 rounded-xl font-medium transition-all group">
            <Clock className="w-4 h-4 text-natural-accent/60 group-hover:text-natural-accent" />
            So'nggi harakatlar
          </button>
          <button className="flex items-center gap-3 px-3 py-2 text-natural-text-muted hover:bg-natural-border/50 rounded-xl font-medium transition-all group">
            <Users className="w-4 h-4 text-natural-accent/60 group-hover:text-natural-accent" />
            Jamoa
          </button>
        </nav>

        <div className="p-4 mt-auto">
          <div className="bg-natural-border/40 p-4 rounded-2xl border border-natural-border shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-natural-accent/20 flex items-center justify-center text-natural-accent font-bold text-xs border border-natural-accent/30">
                {authState.user?.displayName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate text-natural-text">{authState.user?.displayName}</p>
                <p className="text-[10px] text-natural-text-muted truncate">{authState.user?.email}</p>
              </div>
            </div>
            <button 
              onClick={() => auth.signOut()}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600/80 hover:bg-red-50 rounded-lg font-medium transition-all text-sm"
            >
              <LogOut className="w-4 h-4" />
              Chiqish
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-natural-sidebar px-8 flex items-center justify-between sticky top-0 z-10">
          <div className="relative w-96 flex-shrink">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text-muted/50" />
            <input 
              type="text"
              placeholder="Doskalarni qidirish..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-natural-input/80 border-none rounded-full focus:ring-2 focus:ring-natural-accent outline-none transition-all text-sm"
            />
          </div>
          <button 
            onClick={() => setShowNewBoardModal(true)}
            className="flex items-center gap-2 px-6 py-2 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-full font-semibold shadow-md transition-all text-sm"
          >
            <Plus className="w-4 h-4" />
            Yangi Doska
          </button>
        </header>

        <section className="flex-1 overflow-y-auto p-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold tracking-tight text-natural-text">Loyihalarim</h2>
              <span className="px-3 py-1 bg-natural-accent/10 text-natural-accent text-xs font-bold rounded-full border border-natural-accent/20">
                {filteredBoards.length} ta faol
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredBoards.map((board) => (
                  <motion.div
                    key={board.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -4 }}
                    className="group"
                  >
                    <Link 
                      to={`/board/${board.id}`}
                      className="block p-6 bg-white rounded-[2rem] border border-natural-card-border hover:border-natural-accent hover:shadow-xl hover:shadow-natural-border/20 transition-all h-44"
                    >
                      <div className="flex flex-col h-full justify-between">
                        <div>
                          <h3 className="font-bold text-xl mb-1 group-hover:text-natural-accent transition-colors line-clamp-1">{board.title}</h3>
                          <div className="flex items-center gap-2 text-natural-text-muted/60">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="text-xs">{new Date(board.updatedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-4 border-t border-natural-bg">
                          <div className="flex -space-x-2">
                            {board.members.slice(0, 3).map((member, i) => (
                              <div key={i} className="w-7 h-7 rounded-full bg-natural-sidebar border-2 border-white flex items-center justify-center text-[10px] font-bold text-natural-text">
                                {member.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                          <div className="w-8 h-8 rounded-full bg-natural-bg flex items-center justify-center text-natural-text-muted/30 group-hover:bg-natural-accent/10 group-hover:text-natural-accent transition-all">
                            <ChevronRight className="w-5 h-5" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Empty / Add Card */}
              <button 
                onClick={() => setShowNewBoardModal(true)}
                className="group p-6 bg-transparent border-2 border-dashed border-natural-border rounded-[2rem] hover:border-natural-accent hover:bg-natural-accent/5 transition-all h-44 flex flex-col items-center justify-center gap-3 text-natural-text-muted/50 hover:text-natural-accent"
              >
                <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center text-natural-border group-hover:text-natural-accent transition-all">
                  <Plus className="w-6 h-6" />
                </div>
                <span className="font-bold text-sm">Yangi doska qo'shish</span>
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* New Board Modal */}
      {showNewBoardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-natural-text/40 backdrop-blur-sm"
            onClick={() => setShowNewBoardModal(false)}
          />
          <motion.div 
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            className="relative w-full max-w-md bg-white rounded-[2rem] shadow-2xl p-8 border border-natural-border"
          >
            <h3 className="text-xl font-bold mb-1 text-natural-text">Yangi Doska Yaratish</h3>
            <p className="text-natural-text-muted text-sm mb-6">Loyihangiz uchun nom tanlang</p>
            
            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-natural-text-muted mb-1">Doska nomi</label>
                <input
                  type="text"
                  autoFocus
                  required
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  placeholder="masalan: Qishloq xo'jaligi loyihasi"
                  className="w-full px-4 py-3 bg-natural-input border-none rounded-xl focus:ring-2 focus:ring-natural-accent outline-none transition-all"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNewBoardModal(false)}
                  className="flex-1 py-3 text-natural-text-muted bg-natural-sidebar hover:bg-natural-border rounded-xl font-bold transition-all"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-natural-accent hover:bg-natural-accent-hover text-white rounded-xl font-bold shadow-md transition-all"
                >
                  Yaratish
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
