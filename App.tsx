
import React, { useState, useRef, useCallback } from 'react';
import type { PortfolioData, Profile, ContentItem, SkillItem, Comment, ProjectItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { ICONS } from './constants';

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
  ],
  comments: [],
};

// --- HELPER COMPONENTS ---

const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={`bg-slate-800/50 backdrop-blur-sm border border-purple-600/50 rounded-xl p-6 shadow-lg shadow-purple-900/20 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/30 ${className}`}>
    {children}
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode; id: string }> = ({ title, children, id }) => (
  <section id={id} className="mb-16">
    <h2 className="text-4xl font-bold font-orbitron text-center mb-8 text-cyan-400 drop-shadow-[0_0_8px_rgba(0,255,255,0.5)]">{title}</h2>
    {children}
  </section>
);

const AdminButton: React.FC<{ onClick: () => void; children: React.ReactNode; className?: string }> = ({ onClick, children, className }) => (
  <button onClick={onClick} className={`absolute -top-3 -right-3 bg-red-500 text-white rounded-full h-7 w-7 flex items-center justify-center text-xs font-bold transition-transform hover:scale-110 hover:bg-red-400 ${className}`}>
    {children}
  </button>
);

// --- MAIN APP COMPONENT ---

function App() {
  const [data, setData] = useLocalStorage<PortfolioData>('portfolio-data', initialData);
  const [isAdminView, setIsAdminView] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

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

  const handleAddItem = (list: keyof Omit<PortfolioData, 'profile' | 'comments' | 'projects'>) => {
    const newItemText = prompt(`أدخل نص ${list === 'achievements' ? 'الإنجاز' : list === 'skills' ? 'المهارة' : 'المادة'} الجديد:`);
    if (newItemText) {
      const newItem: ContentItem | SkillItem = list === 'skills'
        ? { id: generateId(), text: newItemText, icon: "gamepad" } // Default icon
        : { id: generateId(), text: newItemText };
      setData(prev => ({ ...prev, [list]: [...prev[list], newItem] }));
    }
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
    if (window.confirm("هل أنت متأكد من الحذف؟")) {
      setData(prev => ({ ...prev, [list]: (prev[list] as any[]).filter(item => item.id !== id) }));
    }
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
    if (window.confirm("هل أنت متأكد من حذف هذا التعليق؟")) {
      setData(prev => ({ ...prev, comments: prev.comments.filter(comment => comment.id !== id) }));
    }
  };
  
  const ProfileSection = useCallback(() => (
    <Section title="عني" id="about">
      <div className="flex flex-col md:flex-row items-center justify-center gap-10">
        <div className="relative group">
          <img
            src={data.profile.photo || "https://picsum.photos/300"}
            alt="صورة شخصية"
            className="w-64 h-64 rounded-full object-cover border-4 border-purple-500 shadow-lg shadow-purple-500/40"
          />
          {isAdminView && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-cyan-300 text-lg"
            >
              تغيير الصورة
            </button>
          )}
          <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
        </div>
        <div className="text-center md:text-right">
          <input 
            type="text"
            value={data.profile.name}
            onChange={(e) => handleUpdateProfile('name', e.target.value)}
            readOnly={!isAdminView}
            className="text-5xl font-bold bg-transparent focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-md p-2 text-center md:text-right w-full"
          />
          <input 
            type="text"
            value={data.profile.grade}
            onChange={(e) => handleUpdateProfile('grade', e.target.value)}
            readOnly={!isAdminView}
            className="text-2xl text-cyan-400 mt-2 bg-transparent focus:outline-none focus:ring-1 focus:ring-cyan-400 rounded-md p-2 text-center md:text-right w-full"
          />
        </div>
      </div>
    </Section>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [data.profile, isAdminView]);

  const GenericSection = ({ listKey, title }: { listKey: keyof Omit<PortfolioData, 'profile' | 'comments' | 'projects'>, title: string}) => (
    <Section title={title} id={listKey}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {(data[listKey] as (ContentItem | SkillItem)[]).map((item) => {
            const IconComponent = 'icon' in item ? ICONS[item.icon] : null;
            return (
              <Card key={item.id} className="relative text-center">
                  {isAdminView && <AdminButton onClick={() => handleDeleteItem(listKey, item.id)}>X</AdminButton>}
                  {IconComponent && <div className="text-purple-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><IconComponent/></div>}
                  <h3 className="text-xl font-semibold">{item.text}</h3>
              </Card>
            )
        })}
        {isAdminView && (
            <button onClick={() => handleAddItem(listKey)} className="border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center text-purple-400 hover:bg-purple-500/10 hover:text-cyan-300 transition-colors duration-300 min-h-[150px]">
                + إضافة جديد
            </button>
        )}
      </div>
    </Section>
  );

  const ProjectsSection = () => (
      <Section title="مشاريعي" id="projects">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {data.projects.map((project) => (
            <Card key={project.id} className="relative flex flex-col justify-between">
              {isAdminView && <AdminButton onClick={() => handleDeleteItem('projects', project.id)}>X</AdminButton>}
              <div>
                <h3 className="text-2xl font-bold text-cyan-400 mb-2">{project.title}</h3>
                <p className="text-slate-300 mb-4">{project.description}</p>
              </div>
              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-center w-full bg-purple-600 hover:bg-purple-500 font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/50 hover:shadow-cyan-500/40"
              >
                مشاهدة المشروع
              </a>
            </Card>
          ))}
          {isAdminView && (
            <button
              onClick={handleAddProject}
              className="border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center text-purple-400 hover:bg-purple-500/10 hover:text-cyan-300 transition-colors duration-300 min-h-[150px]"
            >
              + إضافة مشروع جديد
            </button>
          )}
        </div>
      </Section>
  );

  const CommentsSection = () => {
    const [author, setAuthor] = useState('');
    const [text, setText] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleAddComment(author, text);
        setAuthor('');
        setText('');
    };

    return (
        <Section title="آراء المعلمين" id="comments">
            <div className="max-w-3xl mx-auto">
                {/* Add comment form */}
                <Card className="mb-12">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <h3 className="text-xl font-bold text-cyan-300">أضف تعليقك</h3>
                        <input
                            type="text"
                            placeholder="اسمك"
                            value={author}
                            onChange={(e) => setAuthor(e.target.value)}
                            className="w-full bg-slate-900 border border-purple-700 rounded-md p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                        />
                        <textarea
                            placeholder="اكتب تعليقك هنا..."
                            rows={4}
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            className="w-full bg-slate-900 border border-purple-700 rounded-md p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                        />
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 font-bold py-3 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/50 hover:shadow-cyan-500/40">
                            إرسال التعليق
                        </button>
                    </form>
                </Card>

                {/* Display comments */}
                <div className="space-y-6">
                    {data.comments.length === 0 && <p className="text-center text-slate-400">لا توجد تعليقات بعد.</p>}
                    {data.comments.map(comment => (
                        <Card key={comment.id} className="relative">
                             {isAdminView && <AdminButton onClick={() => handleDeleteComment(comment.id)}>X</AdminButton>}
                            <p className="text-slate-300 mb-2">{comment.text}</p>
                            <div className="flex justify-between items-center text-sm text-purple-400">
                                <span>- {comment.author}</span>
                                <span>{comment.date}</span>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        </Section>
    );
  };
  
  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <header className="p-4 sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-800/50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl md:text-2xl font-bold font-orbitron text-cyan-400">ملف إنجاز: محمد كمال خليل</h1>
          <div className="flex items-center space-x-4 space-x-reverse">
            <span className="text-sm">{isAdminView ? 'واجهة الطالب' : 'واجهة الزائر'}</span>
            <label htmlFor="admin-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input id="admin-toggle" type="checkbox" className="sr-only" checked={isAdminView} onChange={() => setIsAdminView(!isAdminView)} />
                <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform peer-checked:translate-x-full"></div>
              </div>
            </label>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-8">
        <ProfileSection />
        <GenericSection listKey="achievements" title="إنجازاتي" />
        <ProjectsSection />
        <GenericSection listKey="skills" title="مهاراتي" />
        <GenericSection listKey="subjects" title="المواد المفضلة" />
        <CommentsSection />
      </main>

      <footer className="text-center p-6 border-t border-purple-800/50 text-slate-500 text-sm">
        <p>تم تصميم هذا الموقع لعرض إنجازات الطالب محمد كمال خليل</p>
      </footer>
    </div>
  );
}

export default App;
