import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Plus, 
  Image as ImageIcon, 
  X, 
  Calendar, 
  Target, 
  BookOpen, 
  Crown,
  Trash2,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Goal, GoalType, DiaryEntry, Photo, View } from './types';

// --- Storage Helpers ---
const STORAGE_KEY = 'lifesync_data';

const loadData = () => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return { goals: [], diary: [], isSubscribed: false };
};

const saveData = (data: any) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
};

// --- Components ---

const AdBanner = () => (
  <div className="w-full bg-zinc-100 border-y border-zinc-200 py-4 px-6 flex items-center justify-center text-xs text-zinc-400 uppercase tracking-widest">
    <div className="flex flex-col items-center gap-1">
      <span>Advertisement</span>
      <div className="h-12 w-full max-w-md bg-zinc-200 rounded animate-pulse flex items-center justify-center">
        Premium Subscription removes these ads
      </div>
    </div>
  </div>
);

const PhotoGrid = ({ photos, onRemove }: { photos: Photo[], onRemove?: (id: string) => void }) => (
  <div className="grid grid-cols-3 gap-2 mt-2">
    {photos.map((photo) => (
      <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden group">
        <img src={photo.url} alt="Uploaded" className="w-full h-full object-cover" />
        {onRemove && (
          <button 
            onClick={() => onRemove(photo.id)}
            className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={12} />
          </button>
        )}
      </div>
    ))}
  </div>
);

const PhotoUploader = ({ onUpload }: { onUpload: (photos: Photo[]) => void }) => {
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload([{
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          timestamp: Date.now()
        }]);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <label className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-full cursor-pointer transition-colors text-sm text-zinc-600">
      <ImageIcon size={16} />
      <span>Add Photos</span>
      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
    </label>
  );
};

interface GoalItemProps {
  goal: Goal;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  key?: string;
}

function GoalItem({ goal, onToggle, onDelete }: GoalItemProps) {
  return (
    <div className="group bg-white border border-zinc-100 rounded-2xl p-4 card-shadow hover:border-zinc-200 transition-all">
      <div className="flex items-start gap-3">
        <button 
          onClick={() => onToggle(goal.id)}
          className={`mt-0.5 transition-colors ${goal.completed ? 'text-emerald-500' : 'text-zinc-300 hover:text-zinc-400'}`}
        >
          {goal.completed ? <CheckCircle2 size={20} /> : <Circle size={20} />}
        </button>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h4 className={`text-sm font-medium transition-all ${goal.completed ? 'text-zinc-400 line-through' : 'text-zinc-900'}`}>
              {goal.title}
            </h4>
            <button 
              onClick={() => onDelete(goal.id)}
              className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={14} />
            </button>
          </div>
          {goal.photos.length > 0 && (
            <div className="mt-3">
              <PhotoGrid photos={goal.photos} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [diary, setDiary] = useState<DiaryEntry[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showSubModal, setShowSubModal] = useState(false);

  // Form states
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalType, setNewGoalType] = useState<GoalType>(GoalType.BIG);
  const [newGoalPhotos, setNewGoalPhotos] = useState<Photo[]>([]);
  
  const [newDiaryContent, setNewDiaryContent] = useState('');
  const [newDiaryPhotos, setNewDiaryPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    const data = loadData();
    setGoals(data.goals);
    setDiary(data.diary);
    setIsSubscribed(data.isSubscribed);
  }, []);

  useEffect(() => {
    saveData({ goals, diary, isSubscribed });
  }, [goals, diary, isSubscribed]);

  const addGoal = () => {
    if (!newGoalTitle.trim()) return;
    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoalTitle,
      description: '',
      type: newGoalType,
      completed: false,
      photos: newGoalPhotos,
      createdAt: Date.now()
    };
    setGoals([goal, ...goals]);
    setNewGoalTitle('');
    setNewGoalPhotos([]);
  };

  const toggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const deleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
  };

  const addDiaryEntry = () => {
    if (!newDiaryContent.trim()) return;
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      content: newDiaryContent,
      photos: newDiaryPhotos,
      createdAt: Date.now()
    };
    setDiary([entry, ...diary]);
    setNewDiaryContent('');
    setNewDiaryPhotos([]);
  };

  const deleteDiaryEntry = (id: string) => {
    setDiary(diary.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col max-w-2xl mx-auto bg-white shadow-xl">
      {/* Header */}
      <header className="p-6 flex items-center justify-between border-b border-zinc-100 sticky top-0 bg-white/80 backdrop-blur-md z-10">
        <div>
          <h1 className="text-2xl font-serif font-bold tracking-tight">LifeSync</h1>
          <p className="text-xs text-zinc-400 uppercase tracking-widest mt-1">
            {view === 'goals' ? 'Goals & Progress' : 'Daily Journal'}
          </p>
        </div>
        <button 
          onClick={() => setShowSubModal(true)}
          className={`p-2 rounded-full transition-colors ${isSubscribed ? 'text-amber-500 bg-amber-50' : 'text-zinc-400 hover:bg-zinc-100'}`}
        >
          <Crown size={20} fill={isSubscribed ? "currentColor" : "none"} />
        </button>
      </header>

      {/* Ad Section */}
      {!isSubscribed && <AdBanner />}

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'goals' ? (
            <motion.div 
              key="goals"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Add Goal Form */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <div className="flex gap-2 mb-3">
                  <button 
                    onClick={() => setNewGoalType(GoalType.BIG)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${newGoalType === GoalType.BIG ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200'}`}
                  >
                    Big Goal
                  </button>
                  <button 
                    onClick={() => setNewGoalType(GoalType.SMALL)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${newGoalType === GoalType.SMALL ? 'bg-zinc-900 text-white' : 'bg-white text-zinc-500 border border-zinc-200'}`}
                  >
                    Small Goal
                  </button>
                </div>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="What's your next target?"
                    className="flex-1 bg-transparent border-none focus:ring-0 text-sm"
                    value={newGoalTitle}
                    onChange={(e) => setNewGoalTitle(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addGoal()}
                  />
                  <button 
                    onClick={addGoal}
                    className="p-2 bg-zinc-900 text-white rounded-xl hover:bg-zinc-800 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <PhotoUploader onUpload={(p) => setNewGoalPhotos([...newGoalPhotos, ...p])} />
                  <span className="text-[10px] text-zinc-400 uppercase">{newGoalPhotos.length} photos added</span>
                </div>
                {newGoalPhotos.length > 0 && (
                  <PhotoGrid photos={newGoalPhotos} onRemove={(id) => setNewGoalPhotos(newGoalPhotos.filter(p => p.id !== id))} />
                )}
              </div>

              {/* Goals List */}
              <div className="space-y-6">
                <section>
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Target size={14} /> Big Goals
                  </h2>
                  <div className="space-y-3">
                    {goals.filter(g => g.type === GoalType.BIG).map(goal => (
                      <GoalItem key={goal.id} goal={goal} onToggle={toggleGoal} onDelete={deleteGoal} />
                    ))}
                    {goals.filter(g => g.type === GoalType.BIG).length === 0 && (
                      <p className="text-sm text-zinc-400 italic">No big goals yet.</p>
                    )}
                  </div>
                </section>

                <section>
                  <h2 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <CheckCircle2 size={14} /> Small Goals
                  </h2>
                  <div className="space-y-3">
                    {goals.filter(g => g.type === GoalType.SMALL).map(goal => (
                      <GoalItem key={goal.id} goal={goal} onToggle={toggleGoal} onDelete={deleteGoal} />
                    ))}
                    {goals.filter(g => g.type === GoalType.SMALL).length === 0 && (
                      <p className="text-sm text-zinc-400 italic">No small goals yet.</p>
                    )}
                  </div>
                </section>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="diary"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Add Diary Form */}
              <div className="bg-zinc-50 p-4 rounded-2xl border border-zinc-100">
                <textarea 
                  placeholder="How was your day?"
                  className="w-full bg-transparent border-none focus:ring-0 text-sm min-h-[100px] resize-none"
                  value={newDiaryContent}
                  onChange={(e) => setNewDiaryContent(e.target.value)}
                />
                <div className="mt-3 flex items-center justify-between">
                  <PhotoUploader onUpload={(p) => setNewDiaryPhotos([...newDiaryPhotos, ...p])} />
                  <button 
                    onClick={addDiaryEntry}
                    disabled={!newDiaryContent.trim()}
                    className="px-4 py-1.5 bg-zinc-900 text-white rounded-full text-sm font-medium hover:bg-zinc-800 transition-colors disabled:opacity-50"
                  >
                    Post Entry
                  </button>
                </div>
                {newDiaryPhotos.length > 0 && (
                  <PhotoGrid photos={newDiaryPhotos} onRemove={(id) => setNewDiaryPhotos(newDiaryPhotos.filter(p => p.id !== id))} />
                )}
              </div>

              {/* Diary List */}
              <div className="space-y-8">
                {diary.map(entry => (
                  <article key={entry.id} className="group">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2 text-zinc-400">
                        <Calendar size={14} />
                        <span className="text-xs font-medium">{new Date(entry.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <button 
                        onClick={() => deleteDiaryEntry(entry.id)}
                        className="p-1 text-zinc-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <p className="text-sm leading-relaxed text-zinc-700 whitespace-pre-wrap font-serif italic">
                      "{entry.content}"
                    </p>
                    {entry.photos.length > 0 && (
                      <div className="mt-4">
                        <PhotoGrid photos={entry.photos} />
                      </div>
                    )}
                    <div className="mt-6 border-b border-zinc-100" />
                  </article>
                ))}
                {diary.length === 0 && (
                  <div className="text-center py-12">
                    <BookOpen size={48} className="mx-auto text-zinc-200 mb-4" />
                    <p className="text-zinc-400">Your journal is empty. Start writing today.</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <nav className="p-4 border-t border-zinc-100 flex items-center justify-around bg-white">
        <button 
          onClick={() => setView('goals')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'goals' ? 'text-zinc-900' : 'text-zinc-400'}`}
        >
          <Target size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Goals</span>
        </button>
        <button 
          onClick={() => setView('diary')}
          className={`flex flex-col items-center gap-1 transition-colors ${view === 'diary' ? 'text-zinc-900' : 'text-zinc-400'}`}
        >
          <BookOpen size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Journal</span>
        </button>
      </nav>

      {/* Subscription Modal */}
      <AnimatePresence>
        {showSubModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200" />
              <button 
                onClick={() => setShowSubModal(false)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-600"
              >
                <X size={20} />
              </button>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-amber-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Crown size={32} className="text-amber-500" fill="currentColor" />
                </div>
                <h3 className="text-xl font-serif font-bold mb-2">LifeSync Premium</h3>
                <p className="text-sm text-zinc-500 mb-8">
                  Unlock unlimited photos, remove ads, and support the development of your personal growth companion.
                </p>
                
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>No more advertisements</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Unlimited photo uploads</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-zinc-700">
                    <CheckCircle2 size={16} className="text-emerald-500" />
                    <span>Cloud Sync (Coming soon)</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    setIsSubscribed(true);
                    setShowSubModal(false);
                  }}
                  className="w-full py-3 bg-zinc-900 text-white rounded-2xl font-bold hover:bg-zinc-800 transition-colors mb-4"
                >
                  {isSubscribed ? 'Already Subscribed' : 'Subscribe for $4.99/mo'}
                </button>
                <p className="text-[10px] text-zinc-400 uppercase tracking-widest">Cancel anytime</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

