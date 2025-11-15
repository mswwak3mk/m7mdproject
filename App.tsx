
import React, { useState, useRef, useEffect } from 'react';
import type { PortfolioData, Profile, ContentItem, SkillItem, Comment, ProjectItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { ICONS, TrashIcon, SearchIcon } from './constants';
import { GoogleGenAI } from "@google/genai";

const initialData: PortfolioData = {
  profile: {
    name: "محمد كمال خليل",
    grade: "الصف الأول المتوسط",
    photo: "https://picsum.photos/seed/student/300/300",
  },
  achievements: [
    { id: '1', text: "إنشاء لعبة إلكترونية" },
    { id: '2', text: "متفوق في الإلكترونيات" },
  ],
  projects: [],
  skills: [
    { id: '1', text: "الألعاب الإلكترونية", icon: "gamepad" },
    { id: '2', text: "كرة القدم", icon: "soccer" },
    { id: '3', text: "كرة الطائرة", icon: "volleyball" },
    { id: '4', text: "السباحة", icon: "swimmer" },
  ],
  subjects: [
    { id: '1', text: "العلوم" },
    { id: '2', text: "الاجتماعيات" },
    { id: '3', text: "البرمجة" },
    { id: '4', text: "الرياضيات" },
    { id: '6', text: "الدراسات الإسلامية" },
  ],
  comments: [],
};

// --- HELPER COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-blue-600/50 rounded-xl p-6 shadow-lg shadow-blue-900/20 transition-all duration-300 hover:scale-105 hover:shadow-blue-500/30 ${className}`}>
    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; id: string }> = ({ title, children, id }) => (
  <section id={id} className="mb-16">
    <h2 className="text-4xl font-bold font-orbitron text-center mb-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">{title}</h2>
    {children}
  </section>
);

const AdminButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className }) => (
  <button 
    onClick={onClick} 
    title="حذف"
    aria-label="Delete item"
    className={`absolute top-3 right-3 bg-slate-700/50 text-slate-300 rounded-full p-2 flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-110 hover:rotate-12 z-20 ${className}`}
  >
    <TrashIcon />
  </button>
);

const EditIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
);


// --- SECTIONAL & MODAL COMPONENTS ---

interface ProfileSectionProps {
  profile: Profile;
  isAdminView: boolean;
  onUpdateProfile: <K extends keyof Profile>(key: K, value: Profile[K]) => void;
  onPhotoUploadClick: () => void;
}

const ProfileSection: React.FC<ProfileSectionProps> = ({ profile, isAdminView, onUpdateProfile, onPhotoUploadClick }) => (
    <Section title="عني" id="about">
      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        <div className="relative group">
          <img
            src={profile.photo || "https://picsum.photos/300"}
            alt="صورة شخصية"
            className="w-64 h-64 rounded-full object-cover border-4 border-blue-500 shadow-lg shadow-blue-500/40"
          />
          {isAdminView && (
            <button
              onClick={onPhotoUploadClick}
              className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-cyan-300 text-lg"
            >
              تغيير الصورة
            </button>
          )}
        </div>
        <div className="text-center md:text-right">
          <input 
            type="text"
            value={profile.name}
            onChange={(e) => onUpdateProfile('name', e.target.value)}
            readOnly={!isAdminView}
            className="text-5xl font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-md p-2 text-center md:text-right w-full"
          />
          <input 
            type="text"
            value={profile.grade}
            onChange={(e) => onUpdateProfile('grade', e.target.value)}
            readOnly={!isAdminView}
            className="text-2xl text-cyan-400 mt-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-md p-2 text-center md:text-right w-full"
          />
        </div>
      </div>
    </Section>
);

const QuestionsAboutMeSection: React.FC<{ portfolioData: PortfolioData }> = ({ portfolioData }) => {
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!question.trim() || isLoading) return;

        setIsLoading(true);
        setError(null);
        setAnswer('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const achievementsText = portfolioData.achievements.map(a => a.text).join('، ');
            const skillsText = portfolioData.skills.map(s => s.text).join('، ');
            const subjectsText = portfolioData.subjects.map(s => s.text).join('، ');
            const projectsText = portfolioData.projects.map(p => `${p.title} (${p.description})`).join('; ');

            const systemInstruction = `
              أنت مساعد ذكي متخصص في الإجابة على الأسئلة المتعلقة بالطالب محمد كمال خليل.
              يجب أن تستند إجاباتك فقط على المعلومات التالية المأخوذة من ملفه الشخصي.
              لا تختلق أي معلومات. إذا كان السؤال خارج نطاق المعلومات المتاحة، أجب بلطف أنك لا تملك هذه المعلومة.
              يجب أن تكون جميع إجاباتك باللغة العربية.

              --- معلومات عن محمد كمال خليل ---
              الاسم: ${portfolioData.profile.name}
              الصف: ${portfolioData.profile.grade}
              الإنجازات: ${achievementsText || 'لا يوجد'}
              المهارات: ${skillsText || 'لا يوجد'}
              المواد المفضلة: ${subjectsText || 'لا يوجد'}
              المشاريع: ${projectsText || 'لا يوجد'}
              --- نهاية المعلومات ---
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: question,
                config: {
                    systemInstruction: systemInstruction,
                },
            });

            setAnswer(response.text);

        } catch (err) {
            console.error("Error calling Gemini API:", err);
            setError("عذراً، حدث خطأ أثناء محاولة الحصول على إجابة. يرجى المحاولة مرة أخرى.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Section title="أسئلة عني" id="questions">
            <Card className="max-w-4xl mx-auto">
                <p className="text-center text-slate-300 mb-6">
                    هل لديك سؤال عني؟ اكتبه هنا وسأحاول الإجابة باستخدام الذكاء الاصطناعي بناءً على معلومات ملفي!
                </p>
                <form onSubmit={handleAskQuestion} className="flex flex-col sm:flex-row gap-4">
                    <input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="ما هي أهم مهارات محمد؟"
                        className="flex-grow bg-slate-700/80 border border-blue-600 rounded-lg px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                        disabled={isLoading}
                    />
                    <button
                        type="submit"
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
                        disabled={isLoading || !question.trim()}
                    >
                        {isLoading ? (
                            <>
                                <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-slate-900"></span>
                                <span>جاري التفكير...</span>
                            </>
                        ) : (
                            <>
                                <SearchIcon />
                                <span>اسأل</span>
                            </>
                        )}
                    </button>
                </form>

                {(isLoading || answer || error) && (
                    <div className="mt-6 p-5 bg-slate-900/50 border border-slate-700 rounded-lg">
                        {isLoading && !answer && <p className="text-cyan-300">يتم الآن توليد الإجابة...</p>}
                        {error && <p className="text-red-400">{error}</p>}
                        {answer && <p className="text-lg whitespace-pre-wrap">{answer}</p>}
                    </div>
                )}
            </Card>
        </Section>
    );
};

interface AchievementsSectionProps {
  achievements: ContentItem[];
  isAdminView: boolean;
  onUpdateAchievement: (id: string, newText: string) => void;
  onDeleteItem: (list: 'achievements', id: string) => void;
  onAddItem: () => void;
}
const AchievementsSection: React.FC<AchievementsSectionProps> = ({ achievements, isAdminView, onUpdateAchievement, onDeleteItem, onAddItem }) => {
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');

    const startEditing = (item: ContentItem) => {
        setEditingId(item.id);
        setEditText(item.text);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditText('');
    };

    const saveEdit = (id: string, text: string) => {
        onUpdateAchievement(id, text);
        cancelEditing();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (editingId) saveEdit(editingId, editText);
        } else if (e.key === 'Escape') {
            cancelEditing();
        }
    };

    return (
        <Section title="إنجازاتي" id="achievements">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {achievements.map((item) => (
                    <Card key={item.id} className="relative text-center flex items-center justify-center min-h-[150px] !p-0">
                        {isAdminView && <AdminButton onClick={() => onDeleteItem('achievements', item.id)} />}
                        
                        {isAdminView && editingId === item.id ? (
                            <div className="w-full p-6">
                                <input
                                    type="text"
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    onBlur={() => saveEdit(item.id, editText)}
                                    className="w-full bg-slate-700 text-center border border-blue-600 rounded-md p-2 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                                    autoFocus
                                />
                            </div>
                        ) : (
                            <div className="relative group w-full p-6" onDoubleClick={() => isAdminView && startEditing(item)}>
                                <h3 className="text-xl font-semibold">{item.text}</h3>
                                {isAdminView && (
                                    <button
                                        onClick={() => startEditing(item)}
                                        aria-label={`تعديل ${item.text}`}
                                        className="absolute bottom-2 left-2 bg-slate-700/80 text-cyan-300 rounded-full p-2 flex items-center justify-center transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100 hover:bg-cyan-600 hover:text-white hover:scale-110"
                                    >
                                        <EditIcon />
                                    </button>
                                )}
                            </div>
                        )}
                    </Card>
                ))}
                {isAdminView && (
                    <button onClick={onAddItem} className="border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:text-cyan-300 transition-colors duration-300 min-h-[150px]">
                        + إضافة جديد
                    </button>
                )}
            </div>
        </Section>
    );
};

interface GenericSectionProps {
  listKey: 'skills' | 'subjects';
  title: string;
  items: (ContentItem | SkillItem)[];
  isAdminView: boolean;
  onDeleteItem: (list: 'skills' | 'subjects', id: string) => void;
  onAdd: () => void;
}
const GenericSection: React.FC<GenericSectionProps> = ({ listKey, title, items, isAdminView, onDeleteItem, onAdd }) => (
    <Section title={title} id={listKey}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => {
            const IconComponent = 'icon' in item ? ICONS[item.icon] : null;
            return (
              <Card 
                key={item.id} 
                className={`relative text-center ${listKey === 'skills' ? 'hover:border-cyan-400' : ''}`}
              >
                  {isAdminView && <AdminButton onClick={() => onDeleteItem(listKey, item.id)} />}
                  {IconComponent && <div className="text-blue-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><IconComponent/></div>}
                  <h3 className="text-xl font-semibold">{item.text}</h3>
              </Card>
            )
        })}
        {isAdminView && (
            <button onClick={onAdd} className="border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:text-cyan-300 transition-colors duration-300 min-h-[150px]">
                + إضافة جديد
            </button>
        )}
      </div>
    </Section>
);

interface ProjectsSectionProps {
  projects: ProjectItem[];
  isAdminView: boolean;
  onAddProject: () => void;
  onDeleteItem: (list: 'projects', id: string) => void;
  onProjectImageChange: (projectId: string) => void;
  onRemoveProjectImage: (projectId: string) => void;
}
const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects, isAdminView, onAddProject, onDeleteItem, onProjectImageChange, onRemoveProjectImage }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8;
        scrollContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    };
    
    if (projects.length === 0 && !isAdminView) {
        return null;
    }

    return (
        <Section title="مشاريعي" id="projects">
            <div className="relative">
                {projects.length > 1 && (
                    <>
                        <button onClick={() => scroll('left')} className="absolute -right-5 top-1/2 -translate-y-1/2 z-10 bg-slate-700/50 rounded-full p-3 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </button>
                        <button onClick={() => scroll('right')} className="absolute -left-5 top-1/2 -translate-y-1/2 z-10 bg-slate-700/50 rounded-full p-3 text-cyan-300 hover:bg-cyan-500 hover:text-white transition-all transform hover:scale-110">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                        </button>
                    </>
                )}
                <div ref={scrollContainerRef} className="flex gap-8 overflow-x-auto snap-x snap-mandatory py-4 scrollbar-hide">
                    {projects.map((project) => (
                        <div key={project.id} className="snap-center shrink-0 w-[90%] sm:w-[45%] lg:w-[30%]">
                            <Card className="h-full flex flex-col">
                                {isAdminView && <AdminButton onClick={() => onDeleteItem('projects', project.id)} />}
                                
                                <div className="relative mb-4 group aspect-video">
                                    <img 
                                      src={project.image || "https://picsum.photos/seed/"+project.id+"/400/225"} 
                                      alt={project.title} 
                                      className="w-full h-full object-cover rounded-lg" 
                                    />
                                    {isAdminView && (
                                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                                            <button onClick={() => onProjectImageChange(project.id)} className="text-white hover:text-cyan-300 transition-colors">تغيير الصورة</button>
                                            {project.image && <button onClick={() => onRemoveProjectImage(project.id)} className="text-white hover:text-red-400 transition-colors">إزالة</button>}
                                        </div>
                                    )}
                                </div>

                                <h3 className="text-2xl font-bold mb-2 text-cyan-400">{project.title}</h3>
                                <p className="text-slate-300 mb-4 flex-grow">{project.description}</p>
                                <a href={project.link} target="_blank" rel="noopener noreferrer" className="mt-auto inline-block bg-blue-600/80 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-500 transition-colors text-center">
                                    عرض المشروع
                                </a>
                            </Card>
                        </div>
                    ))}
                    {isAdminView && (
                        <div className="snap-center shrink-0 w-[90%] sm:w-[45%] lg:w-[30%]">
                            <button onClick={onAddProject} className="w-full h-full border-2 border-dashed border-blue-500 rounded-xl flex items-center justify-center text-blue-400 hover:bg-blue-500/10 hover:text-cyan-300 transition-colors duration-300 min-h-[300px]">
                                + إضافة مشروع
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </Section>
    );
};

interface CommentsSectionProps {
  comments: Comment[];
  isAdminView: boolean;
  onAddComment: (author: string, text: string) => void;
  onDeleteComment: (id: string) => void;
}
const CommentsSection: React.FC<CommentsSectionProps> = ({ comments, isAdminView, onAddComment, onDeleteComment }) => {
    const [author, setAuthor] = useState('');
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddComment(author, text);
      setAuthor('');
      setText('');
    };

    return (
      <Section title="كلمة المعلمين" id="comments">
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">التعليقات</h3>
            {comments.length > 0 ? (
                comments.map((comment) => (
                    <Card key={comment.id} className="relative">
                        {isAdminView && <AdminButton onClick={() => onDeleteComment(comment.id)} />}
                        <p className="mb-2">"{comment.text}"</p>
                        <div className="text-left text-sm text-blue-400 mt-4">
                            - {comment.author}, <span className="text-slate-400">{comment.date}</span>
                        </div>
                    </Card>
                ))
            ) : (
                <p className="text-slate-400">لا توجد تعليقات بعد. كن أول من يكتب تعليقاً!</p>
            )}
          </div>
          <div>
            <h3 className="text-2xl font-bold text-cyan-400 mb-4">أضف تعليقك</h3>
            <Card>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="author" className="block mb-2 text-slate-300">الاسم</label>
                  <input
                    type="text"
                    id="author"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    className="w-full bg-slate-700/80 border border-blue-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    placeholder="اسم المعلم"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="comment" className="block mb-2 text-slate-300">التعليق</label>
                  <textarea
                    id="comment"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-700/80 border border-blue-600 rounded-lg px-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition"
                    placeholder="اكتب تعليقك هنا..."
                    required
                  />
                </div>
                <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold py-2 px-4 rounded-lg transition-colors">
                  إرسال التعليق
                </button>
              </form>
            </Card>
          </div>
        </div>
      </Section>
    );
};
  
const SkillModal: React.FC<{ onClose: () => void, onAdd: (name: string, icon: string) => void }> = ({ onClose, onAdd }) => {
    const [skillName, setSkillName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState('gamepad');

    const handleAddClick = () => {
        onAdd(skillName, selectedIcon);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-blue-600 rounded-xl p-8 shadow-lg w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-cyan-400 mb-6 text-center">إضافة مهارة جديدة</h3>
                <div className="mb-4">
                    <label htmlFor="skillName" className="block mb-2">اسم المهارة</label>
                    <input 
                        id="skillName"
                        type="text" 
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        className="w-full bg-slate-700 border border-blue-500 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                        placeholder="مثال: البرمجة"
                    />
                </div>
                <div className="mb-6">
                    <label className="block mb-2">اختر أيقونة</label>
                    <div className="grid grid-cols-4 gap-4">
                        {Object.entries(ICONS).map(([name, Icon]) => (
                            <button 
                                key={name} 
                                onClick={() => setSelectedIcon(name)}
                                className={`p-4 rounded-lg flex justify-center items-center transition-all ${selectedIcon === name ? 'bg-cyan-500/20 ring-2 ring-cyan-400' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                                <Icon />
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex justify-end gap-4">
                    <button onClick={onClose} className="py-2 px-4 rounded-lg text-slate-300 hover:bg-slate-700 transition-colors">إلغاء</button>
                    <button onClick={handleAddClick} className="py-2 px-6 rounded-lg bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition-colors">إضافة</button>
                </div>
            </div>
        </div>
    );
};
  
const PasswordModal: React.FC<{ onClose: () => void, onCorrect: () => void }> = ({ onClose, onCorrect }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === '1234') { // Simple password
            onCorrect();
        } else {
            setError(true);
            setPassword('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-blue-600 rounded-xl p-8 shadow-lg w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-bold text-cyan-400 mb-4 text-center">إدخال كلمة المرور</h3>
                <form onSubmit={handleSubmit}>
                    <input
                        ref={inputRef}
                        type="password"
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setError(false); }}
                        className={`w-full bg-slate-700 border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2  transition-all ${error ? 'border-red-500 ring-red-500' : 'border-blue-500 focus:ring-cyan-400'}`}
                        placeholder="كلمة المرور"
                    />
                     {error && <p className="text-red-400 text-sm text-center mb-4">كلمة المرور غير صحيحة.</p>}
                    <button type="submit" className="w-full py-2 px-6 rounded-lg bg-cyan-500 text-slate-900 font-bold hover:bg-cyan-400 transition-colors">
                        دخول
                    </button>
                </form>
            </div>
        </div>
    );
};
    
const ConfirmationModal: React.FC<{ isOpen: boolean; message: string; onConfirm: (() => void) | null; onCancel: () => void; }> = ({ isOpen, message, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-red-500/50 rounded-xl p-8 shadow-lg w-full max-w-sm" role="alertdialog" aria-modal="true" aria-labelledby="dialog-title">
                <h3 id="dialog-title" className="text-xl font-bold text-red-400 mb-4 text-center">تأكيد الإجراء</h3>
                <p className="text-slate-300 text-center mb-6">{message}</p>
                <div className="flex justify-center gap-4">
                    <button onClick={onCancel} className="py-2 px-6 rounded-lg bg-slate-600 text-white font-bold hover:bg-slate-500 transition-colors">
                        إلغاء
                    </button>
                    <button onClick={() => onConfirm?.()} className="py-2 px-6 rounded-lg bg-red-600 text-white font-bold hover:bg-red-500 transition-colors">
                        حذف
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- MAIN APP COMPONENT ---

function App() {
  const [data, setData] = useLocalStorage<PortfolioData>('portfolio-data', initialData);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const projectImageInputRef = useRef<HTMLInputElement>(null);

  const [confirmModalState, setConfirmModalState] = useState<{
    isOpen: boolean;
    message: string;
    onConfirm: (() => void) | null;
  }>({ isOpen: false, message: '', onConfirm: null });
  
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

  const closeConfirmModal = () => {
    setConfirmModalState({ isOpen: false, message: '', onConfirm: null });
  };

  const handleAdminToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isTryingToEnable = e.target.checked;
    
    if (isTryingToEnable) {
      setIsPasswordModalOpen(true);
    } else {
      setIsAdminView(false);
    }
  };

  const handleUpdateProfile = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setData(prev => ({ ...prev, profile: { ...prev.profile, [key]: value } }));
  };

  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdateProfile('photo', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddItem = (list: 'achievements' | 'subjects') => {
    const newItemText = prompt(`أدخل نص ${list === 'achievements' ? 'الإنجاز' : 'المادة'} الجديد:`);
    if (newItemText) {
      const newItem: ContentItem = { id: generateId(), text: newItemText };
      setData(prev => ({ ...prev, [list]: [...prev[list], newItem] }));
    }
  };
  
  const handleUpdateAchievement = (id: string, newText: string) => {
    if (!newText.trim()) {
        alert("نص الإنجاز لا يمكن أن يكون فارغًا.");
        return;
    }
    setData(prev => ({
        ...prev,
        achievements: prev.achievements.map(item =>
            item.id === id ? { ...item, text: newText.trim() } : item
        )
    }));
  };

  const handleAddSkill = (skillName: string, iconName: string) => {
      if(skillName.trim() === '') {
        alert("يرجى إدخال اسم المهارة.");
        return;
      }
      const newSkill: SkillItem = { id: generateId(), text: skillName, icon: iconName };
      setData(prev => ({ ...prev, skills: [...prev.skills, newSkill] }));
      setIsSkillModalOpen(false);
  };

  const handleAddProject = () => {
    const title = prompt("أدخل عنوان المشروع:");
    if (!title) return;
    const description = prompt("أدخل وصف المشروع:");
    if (!description) return;
    const link = prompt("أدخل رابط المشروع (https://...):");
    if (!link) return;

    const newProject: ProjectItem = {
        id: generateId(),
        title,
        description,
        link
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProject] }));
  };
  
  const handleDeleteItem = (list: keyof Omit<PortfolioData, 'profile' | 'comments'>, id: string) => {
    const performDelete = () => {
        setData(prev => ({ ...prev, [list]: (prev[list] as any[]).filter(item => item.id !== id) }));
        closeConfirmModal();
    };

    setConfirmModalState({
        isOpen: true,
        message: 'هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء.',
        onConfirm: performDelete,
    });
  };

  const handleAddComment = (author: string, text: string) => {
    if(author.trim() === '' || text.trim() === '') {
        alert("يرجى ملء اسمك والتعليق.");
        return;
    }
    const newComment: Comment = {
      id: generateId(),
      author,
      text,
      date: new Date().toLocaleDateString('ar-EG'),
    };
    setData(prev => ({ ...prev, comments: [...prev.comments, newComment] }));
  };

   const handleDeleteComment = (id: string) => {
    const performDelete = () => {
      setData(prev => ({ ...prev, comments: prev.comments.filter(comment => comment.id !== id) }));
      closeConfirmModal();
    };
    setConfirmModalState({
        isOpen: true,
        message: 'هل أنت متأكد من حذف هذا التعليق؟',
        onConfirm: performDelete,
    });
  };
  
    const handleProjectImageChange = (projectId: string) => {
        setEditingProjectId(projectId);
        projectImageInputRef.current?.click();
    };

    const handleProjectImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (!editingProjectId) return;

        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setData(prev => ({
                    ...prev,
                    projects: prev.projects.map(p =>
                        p.id === editingProjectId ? { ...p, image: reader.result as string } : p
                    )
                }));
                setEditingProjectId(null);
            };
            reader.readAsDataURL(file);
        } else {
            setEditingProjectId(null);
        }
        if (event.target) {
            event.target.value = '';
        }
    };
    
    const handleRemoveProjectImage = (projectId: string) => {
      const performDelete = () => {
          setData(prev => ({
              ...prev,
              projects: prev.projects.map(p =>
                  p.id === projectId ? { ...p, image: null } : p
              )
          }));
          closeConfirmModal();
      };
      setConfirmModalState({
        isOpen: true,
        message: 'هل أنت متأكد من حذف صورة المشروع؟',
        onConfirm: performDelete,
      });
    };

  const filteredProjects = data.projects.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.description.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900/50 p-4 sm:p-8">
      
      {/* --- MODALS --- */}
      {isSkillModalOpen && <SkillModal onClose={() => setIsSkillModalOpen(false)} onAdd={handleAddSkill} />}
      {isPasswordModalOpen && <PasswordModal 
        onClose={() => setIsPasswordModalOpen(false)} 
        onCorrect={() => {
            setIsAdminView(true);
            setIsPasswordModalOpen(false);
        }}
      />}
      <ConfirmationModal 
        isOpen={confirmModalState.isOpen}
        message={confirmModalState.message}
        onConfirm={confirmModalState.onConfirm}
        onCancel={closeConfirmModal}
      />
      
      {/* --- HEADER & CONTROLS --- */}
      <header className="max-w-7xl mx-auto mb-16 flex flex-col sm:flex-row justify-between items-center gap-4">
        <h1 className="text-3xl sm:text-4xl font-bold font-orbitron text-center">ملف إنجاز الطالب</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <input 
              type="text"
              placeholder="ابحث في المشاريع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-slate-800/60 border border-blue-600 rounded-full pl-10 pr-4 py-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition-all w-48 focus:w-64"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <SearchIcon />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="adminToggle" className="cursor-pointer text-sm">وضع التعديل</label>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="adminToggle" className="sr-only peer" checked={isAdminView} onChange={handleAdminToggle} />
              <div className="w-11 h-6 bg-slate-700 rounded-full peer peer-focus:ring-4 peer-focus:ring-cyan-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
            </label>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <ProfileSection 
            profile={data.profile}
            isAdminView={isAdminView}
            onUpdateProfile={handleUpdateProfile}
            onPhotoUploadClick={() => fileInputRef.current?.click()}
        />
        <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
        
        <QuestionsAboutMeSection portfolioData={data} />
        
        <AchievementsSection 
            achievements={data.achievements}
            isAdminView={isAdminView}
            onAddItem={() => handleAddItem('achievements')}
            onDeleteItem={handleDeleteItem}
            onUpdateAchievement={handleUpdateAchievement}
        />

        <GenericSection 
            listKey="skills" 
            title="مهاراتي" 
            items={data.skills}
            isAdminView={isAdminView}
            onDeleteItem={handleDeleteItem}
            onAdd={() => setIsSkillModalOpen(true)}
        />
        <GenericSection 
            listKey="subjects" 
            title="المواد المفضلة" 
            items={data.subjects}
            isAdminView={isAdminView}
            onDeleteItem={handleDeleteItem}
            onAdd={() => handleAddItem('subjects')}
        />

        <ProjectsSection 
            projects={filteredProjects} 
            isAdminView={isAdminView}
            onAddProject={handleAddProject}
            onDeleteItem={handleDeleteItem}
            onProjectImageChange={handleProjectImageChange}
            onRemoveProjectImage={handleRemoveProjectImage}
        />
        
        <CommentsSection 
            comments={data.comments}
            isAdminView={isAdminView}
            onAddComment={handleAddComment}
            onDeleteComment={handleDeleteComment}
        />
      </main>

      <input type="file" ref={projectImageInputRef} onChange={handleProjectImageUpload} className="hidden" accept="image/*" />

      <footer className="text-center mt-16 text-slate-400 text-sm">
        <p>تم التصميم والتطوير بواسطة الذكاء الاصطناعي</p>
      </footer>
    </div>
  );
}

export default App;
