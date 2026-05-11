import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGlobal } from '../context/GlobalContext';
import { db } from '../firebase/config';
import { collection, doc, onSnapshot, query, where, orderBy, updateDoc, addDoc, serverTimestamp, deleteDoc } from 'firebase/firestore';
import { Board, Column, Task } from '../types';
import { 
  ChevronLeft, Users, Settings, MoreHorizontal, Plus, 
  Trash2, X, Calendar, MessageSquare, AlertCircle, 
  CheckCircle2, Clock, Filter, Search, GripVertical
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay, 
  closestCorners, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  defaultDropAnimationSideEffects,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent
} from '@dnd-kit/core';
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { format } from 'date-fns';

// --- Sortable Column Component ---
interface SortableColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onTaskClick: (task: Task) => void;
  key?: any;
}

function SortableColumn({ column, tasks, onAddTask, onDeleteColumn, onTaskClick }: SortableColumnProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'Column',
      column,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex flex-col w-80 min-w-80 h-full bg-natural-sidebar/30 rounded-[2rem] border border-natural-border/50 flex-shrink-0 ${isDragging ? 'opacity-50 border-natural-accent' : ''}`}
    >
      <div 
        {...attributes}
        {...listeners}
        className="p-5 flex items-center justify-between cursor-grab active:cursor-grabbing group"
      >
        <div className="flex items-center gap-2">
          <h3 className="font-bold text-natural-text">{column.title}</h3>
          <span className="text-xs font-normal text-natural-text-muted bg-natural-sidebar px-2 rounded-full">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
            onClick={() => onAddTask(column.id)}
            className="p-1.5 hover:bg-natural-accent/10 text-natural-accent rounded-md"
          >
            <Plus className="w-4 h-4" />
          </button>
          <button 
            onClick={() => onDeleteColumn(column.id)}
            className="p-1.5 hover:bg-red-50 text-red-400 rounded-md"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 pb-4 overflow-y-auto kanban-scrollbar space-y-4 min-h-[100px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />
          ))}
        </SortableContext>
      </div>

      <button 
        onClick={() => onAddTask(column.id)}
        className="mx-4 mb-4 p-3 flex items-center justify-center gap-2 text-sm font-semibold text-natural-text-muted/70 hover:text-natural-accent hover:bg-natural-accent/5 rounded-2xl transition-all border border-dashed border-natural-border hover:border-natural-accent/30"
      >
        <Plus className="w-4 h-4" />
        Vazifa qo'shish
      </button>
    </div>
  );
}

// --- Sortable Task Component ---
interface SortableTaskCardProps {
  task: Task;
  onClick: () => void;
  key?: any;
}

function SortableTaskCard({ task, onClick }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityColors = {
    low: 'bg-green-50 text-green-700 border-green-100',
    medium: 'bg-amber-50 text-amber-700 border-amber-100',
    high: 'bg-red-50 text-red-700 border-red-100',
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      className={`group p-5 bg-white rounded-3xl shadow-sm border border-natural-card-border hover:border-natural-accent transition-colors cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30 border-natural-accent' : ''}`}
    >
      <div className="flex items-start justify-between mb-3 text-natural-text">
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${priorityColors[task.priority]}`}>
          {task.priority === 'low' ? 'Past' : task.priority === 'medium' ? "O'rta" : 'Yuqori'}
        </span>
        <GripVertical className="w-4 h-4 text-neutral-300 opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      
      <h4 className="font-bold text-natural-text mb-1 leading-tight">{task.title}</h4>
      {task.description && (
        <p className="text-xs text-natural-text-muted line-clamp-2 mt-1">{task.description}</p>
      )}
      
      <div className="mt-4 pt-4 border-t border-natural-bg flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-natural-text-muted/60">
          <Calendar className="w-3.5 h-3.5" />
          <span className="text-[11px] font-medium">
            {task.dueDate ? format(new Date(task.dueDate), 'd MMM') : format(new Date(task.createdAt), 'd MMM')}
          </span>
        </div>
        <div className="flex -space-x-1.5 ml-auto">
          {task.assignees?.map((a, i) => (
            <div key={i} className="w-6 h-6 rounded-full bg-natural-sidebar border border-white flex items-center justify-center text-[8px] font-bold text-natural-text shadow-sm">
              {a.charAt(0).toUpperCase()}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import TaskModal from '../components/TaskModal';

// --- Main Page Component ---
export default function BoardDetails() {
  const { boardId } = useParams();
  const { state: authState } = useAuth();
  const { state: globalState, dispatch: globalDispatch } = useGlobal();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeColumn, setActiveColumn] = useState<Column | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTaskColumnId, setNewTaskColumnId] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [detailTask, setDetailTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (!boardId) return;

    // Fetch Board
    const boardUnsubscribe = onSnapshot(doc(db, 'boards', boardId), (docSnap) => {
      if (docSnap.exists()) {
        globalDispatch({ type: 'SET_CURRENT_BOARD', payload: { id: docSnap.id, ...docSnap.data() } as Board });
      }
    });

    // Fetch Columns
    const columnsUnsubscribe = onSnapshot(
      query(collection(db, 'boards', boardId, 'columns'), orderBy('order', 'asc')),
      (snapshot) => {
        const columns = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Column[];
        globalDispatch({ type: 'SET_COLUMNS', payload: columns });
      }
    );

    // Fetch Tasks
    const tasksUnsubscribe = onSnapshot(
      query(collection(db, 'boards', boardId, 'tasks'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Task[];
        globalDispatch({ type: 'SET_TASKS', payload: tasks });
      }
    );

    return () => {
      boardUnsubscribe();
      columnsUnsubscribe();
      tasksUnsubscribe();
    };
  }, [boardId, globalDispatch]);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const type = active.data.current?.type;

    if (type === 'Column') {
      setActiveColumn(active.data.current?.column);
      return;
    }

    if (type === 'Task') {
      setActiveTask(active.data.current?.task);
      return;
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveTask = active.data.current?.type === 'Task';
    const isOverTask = over.data.current?.type === 'Task';

    if (!isActiveTask) return;

    // Dropping a task over another task
    if (isActiveTask && isOverTask) {
      const activeIdx = globalState.tasks.findIndex(t => t.id === activeId);
      const overIdx = globalState.tasks.findIndex(t => t.id === overId);

      if (globalState.tasks[activeIdx].columnId !== globalState.tasks[overIdx].columnId) {
        const updatedTasks = [...globalState.tasks];
        updatedTasks[activeIdx] = { 
          ...updatedTasks[activeIdx], 
          columnId: updatedTasks[overIdx].columnId 
        };
        globalDispatch({ type: 'SET_TASKS', payload: arrayMove(updatedTasks, activeIdx, overIdx) });
      }
    }

    // Dropping a task over a column
    const isOverColumn = over.data.current?.type === 'Column';
    if (isActiveTask && isOverColumn) {
      const activeIdx = globalState.tasks.findIndex(t => t.id === activeId);
      const updatedTasks = [...globalState.tasks];
      updatedTasks[activeIdx] = { 
        ...updatedTasks[activeIdx], 
        columnId: overId as string
      };
      globalDispatch({ type: 'SET_TASKS', payload: arrayMove(updatedTasks, activeIdx, activeIdx) });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null);
    setActiveColumn(null);

    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const type = active.data.current?.type;

    if (type === 'Column') {
      const oldIndex = globalState.columns.findIndex(c => c.id === activeId);
      const newIndex = globalState.columns.findIndex(c => c.id === overId);
      const newColumns = arrayMove(globalState.columns, oldIndex, newIndex);
      
      globalDispatch({ type: 'SET_COLUMNS', payload: newColumns });
      
      // Update Firestore orders
      newColumns.forEach(async (col: any, idx: number) => {
        await updateDoc(doc(db, 'boards', boardId!, 'columns', col.id), { order: idx });
      });
    }

    if (type === 'Task') {
      const task = globalState.tasks.find(t => t.id === activeId);
      const overTask = globalState.tasks.find(t => t.id === overId);
      const overColumn = globalState.columns.find(c => c.id === overId);

      if (task) {
        let newColumnId = task.columnId;
        if (overTask) newColumnId = overTask.columnId;
        else if (overColumn) newColumnId = overColumn.id;

        await updateDoc(doc(db, 'boards', boardId!, 'tasks', task.id), { 
          columnId: newColumnId,
          updatedAt: Date.now()
        });
      }
    }
  };

  const handleAddTask = async (columnId: string) => {
    setNewTaskColumnId(columnId);
    setShowTaskModal(true);
  };

  const submitNewTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !authState.user || !boardId) return;

    try {
      const taskData = {
        title: newTaskTitle,
        description: '',
        priority: 'medium',
        dueDate: null,
        boardId: boardId,
        columnId: newTaskColumnId,
        ownerId: authState.user.uid,
        assignees: [authState.user.uid],
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      await addDoc(collection(db, 'boards', boardId, 'tasks'), taskData);
      setNewTaskTitle('');
      setShowTaskModal(false);
    } catch (error) {
      console.error("Vazifa yaratishda xatolik:", error);
    }
  };

  const handleDeleteColumn = async (columnId: string) => {
    if (!window.confirm("Haqiqatan ham bu ustunni va undagi barcha vazifalarni o'chirmoqchimisiz?")) return;
    try {
      await deleteDoc(doc(db, 'boards', boardId!, 'columns', columnId));
      // Delete tasks in that column
      const colTasks = globalState.tasks.filter(t => t.columnId === columnId);
      for (const t of colTasks) {
        await deleteDoc(doc(db, 'boards', boardId!, 'tasks', t.id));
      }
    } catch (error) {
      console.error("Ustunni o'chirishda xatolik:", error);
    }
  };

  const handleCreateColumn = async () => {
    const title = prompt("Yangi ustun nomini kiriting:");
    if (!title || !boardId) return;

    try {
      await addDoc(collection(db, 'boards', boardId, 'columns'), {
        title,
        boardId,
        order: globalState.columns.length,
        taskOrder: []
      });
    } catch (error) {
      console.error("Ustun yaratishda xatolik:", error);
    }
  };

  if (!globalState.currentBoard) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-neutral-50 text-neutral-400">
        <Clock className="w-8 h-8 animate-spin mr-3 text-blue-600" />
        Doska yuklanmoqda...
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-natural-bg overflow-hidden text-natural-text">
      {/* Top Header */}
      <header className="h-20 flex-shrink-0 bg-white/50 backdrop-blur-md border-b border-natural-sidebar px-8 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <Link to="/" className="p-2 hover:bg-natural-sidebar rounded-full transition-all text-natural-text-muted">
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-natural-text">{globalState.currentBoard.title}</h1>
            <span className="px-3 py-1 bg-natural-accent/10 text-natural-accent text-[10px] font-bold rounded-full border border-natural-accent/20 uppercase tracking-widest leading-none">
              Faol
            </span>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-natural-text-muted" />
            <input type="text" placeholder="Qidiruv..." className="bg-natural-input border-none rounded-full px-10 py-2 text-sm w-64 focus:ring-2 focus:ring-natural-accent outline-none" />
          </div>
          <div className="flex -space-x-2 mr-2">
            {globalState.currentBoard.members.map((m, i) => (
              <div key={i} className="w-9 h-9 rounded-full bg-natural-sidebar border-2 border-white flex items-center justify-center text-[10px] font-bold text-natural-text shadow-sm" title={m}>
                {m.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <button className="bg-natural-accent hover:bg-natural-accent-hover text-white px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-md flex items-center gap-2">
            <Users className="w-4 h-4" />
            A'zolar
          </button>
          <button className="p-2 hover:bg-natural-sidebar rounded-full text-natural-text-muted transition-all">
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Board Content */}
      <main className="flex-1 p-8 overflow-x-auto kanban-scrollbar flex items-start gap-8 relative">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragEnd={onDragEnd}
        >
          <SortableContext 
            items={globalState.columns.map(c => c.id)} 
            strategy={horizontalListSortingStrategy}
          >
            {globalState.columns.map((column) => (
              <SortableColumn 
                key={column.id} 
                column={column} 
                tasks={globalState.tasks.filter(t => t.columnId === column.id)}
                onAddTask={handleAddTask}
                onDeleteColumn={handleDeleteColumn}
                onTaskClick={(task) => setDetailTask(task)}
              />
            ))}
          </SortableContext>

          {/* New Column Button */}
          <button 
            onClick={handleCreateColumn}
            className="flex-shrink-0 w-80 h-16 bg-transparent border-2 border-dashed border-natural-border hover:border-natural-accent hover:bg-natural-accent/5 rounded-[2rem] flex items-center justify-center gap-2 text-natural-text-muted font-bold transition-all"
          >
            <Plus className="w-5 h-5" />
            Yangi ustun
          </button>

          {/* Drag Overlay for smooth animations */}
          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: '0.5',
                },
              },
            }),
          }}>
            {activeColumn && (
              <div className="w-80 h-full bg-white rounded-[2rem] shadow-2xl border-2 border-natural-accent flex flex-col pointer-events-none rotate-2">
                <div className="p-5 border-b border-natural-bg flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-natural-text">{activeColumn.title}</h3>
                  </div>
                </div>
                <div className="flex-1 p-5 space-y-4">
                  {globalState.tasks.filter(t => t.columnId === activeColumn.id).map(t => (
                    <div key={t.id} className="p-5 bg-white rounded-3xl border border-natural-card-border h-32"></div>
                  ))}
                </div>
              </div>
            )}
            {activeTask && (
              <div className="w-[320px] p-5 bg-white rounded-3xl shadow-2xl border-2 border-natural-accent rotate-2 pointer-events-none">
                <h4 className="font-bold text-natural-text line-clamp-1">{activeTask.title}</h4>
              </div>
            )}
          </DragOverlay>
        </DndContext>
      </main>

      {/* Task Creation Modal */}
      <AnimatePresence>
        {showTaskModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm"
              onClick={() => setShowTaskModal(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-8"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Yangi Vazifa</h3>
                <button onClick={() => setShowTaskModal(false)} className="p-1 hover:bg-neutral-100 rounded-full transition-all">
                  <X className="w-5 h-5 text-neutral-400" />
                </button>
              </div>
              
              <form onSubmit={submitNewTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-1">Xulosa</label>
                  <input
                    type="text"
                    autoFocus
                    required
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    placeholder="masalan: Dizayn tizimini yaratish"
                    className="w-full px-4 py-2 bg-neutral-50 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowTaskModal(false)}
                    className="flex-1 py-2 text-neutral-600 bg-neutral-100 hover:bg-neutral-200 rounded-lg font-medium transition-all"
                  >
                    Bekor qilish
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-200 transition-all font-bold"
                  >
                    Qo'shish
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Task Detail Modal */}
      <AnimatePresence>
        {detailTask && (
          <TaskModal 
            task={detailTask} 
            boardId={boardId!} 
            onClose={() => setDetailTask(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
