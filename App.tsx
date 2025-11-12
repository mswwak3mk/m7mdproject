
import React, { useState, useRef, useCallback } from 'react';
import type { PortfolioData, Profile, ContentItem, SkillItem, Comment, ProjectItem } from './types';
import useLocalStorage from './hooks/useLocalStorage';
import { ICONS, TrashIcon, SearchIcon } from './constants';

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
    { id: '5', text: "الحاسب" },
    { id: '6', text: "الدراسات الإسلامية" },
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

const AdminButton: React.FC<{ onClick: () => void; className?: string }> = ({ onClick, className }) => (
  <button 
    onClick={onClick} 
    title="حذف"
    aria-label="Delete item"
    className={`absolute top-3 right-3 bg-slate-700/50 text-slate-300 rounded-full p-2 flex items-center justify-center transition-all duration-200 hover:bg-red-500 hover:text-white hover:scale-110 hover:rotate-12 ${className}`}
  >
    <TrashIcon />
  </button>
);


// --- MAIN APP COMPONENT ---

function App() {
  const [data, setData] = useLocalStorage<PortfolioData>('portfolio-data', initialData);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isSkillModalOpen, setIsSkillModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleAddItem = (list: keyof Omit<PortfolioData, 'profile' | 'comments' | 'projects' | 'skills'>) => {
    const newItemText = prompt(`أدخل نص ${list === 'achievements' ? 'الإنجاز' : 'المادة'} الجديد:`);
    if (newItemText) {
      const newItem: ContentItem = { id: generateId(), text: newItemText };
      setData(prev => ({ ...prev, [list]: [...prev[list], newItem] }));
    }
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
              <Card 
                key={item.id} 
                className={`relative text-center ${listKey === 'skills' ? 'hover:border-cyan-400' : ''}`}
              >
                  {isAdminView && <AdminButton onClick={() => handleDeleteItem(listKey, item.id)} />}
                  {IconComponent && <div className="text-purple-400 w-16 h-16 mx-auto mb-4 flex items-center justify-center"><IconComponent/></div>}
                  <h3 className="text-xl font-semibold">{item.text}</h3>
              </Card>
            )
        })}
        {isAdminView && (
            <button onClick={() => listKey === 'skills' ? setIsSkillModalOpen(true) : handleAddItem(listKey as any)} className="border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center text-purple-400 hover:bg-purple-500/10 hover:text-cyan-300 transition-colors duration-300 min-h-[150px]">
                + إضافة جديد
            </button>
        )}
      </div>
    </Section>
  );

  const ProjectsSection = ({ projects }: { projects: ProjectItem[] }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
      if (scrollContainerRef.current) {
        const scrollAmount = scrollContainerRef.current.clientWidth * 0.8; // Scroll by 80% of the visible width
        scrollContainerRef.current.scrollBy({
          left: direction === 'left' ? -scrollAmount : scrollAmount,
          behavior: 'smooth',
        });
      }
    };

    return (
      <Section title="مشاريعي" id="projects">
        <div className="relative group"> {/* Use group for showing arrows on hover */}
          {/* Carousel Container */}
          <div
            ref={scrollContainerRef}
            className="flex items-stretch overflow-x-auto snap-x snap-mandatory scroll-smooth py-4 gap-6 md:gap-8 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          >
            {/* Project Cards */}
            {projects.map((project) => (
              <div key={project.id} className="snap-center flex-shrink-0 w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]">
                <Card className="h-full !scale-100 flex flex-col justify-between bg-gradient-to-br from-slate-800/50 to-purple-900/30"> {/* Full height card */}
                  {isAdminView && <AdminButton onClick={() => handleDeleteItem('projects', project.id)} />}
                  <div>
                    <h3 className="text-2xl font-bold text-cyan-400 mb-2">{project.title}</h3>
                    <p className="text-slate-300 mb-4">{project.description}</p>
                  </div>
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 block text-center w-full bg-purple-600 hover:bg-purple-500 font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-lg shadow-purple-900/50 hover:shadow-cyan-500/40 hover:shadow-xl hover:-translate-y-1"
                  >
                    مشاهدة المشروع
                  </a>
                </Card>
              </div>
            ))}

            {/* Admin "Add" Card */}
            {isAdminView && (
              <div className="snap-center flex-shrink-0 w-full sm:w-[calc(50%-0.75rem)] md:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.33rem)]">
                <button
                  onClick={handleAddProject}
                  className="w-full h-full border-2 border-dashed border-purple-500 rounded-xl flex items-center justify-center text-purple-400 hover:bg-purple-500/10 hover:text-cyan-300 transition-colors duration-300 min-h-[250px]"
                >
                  + إضافة مشروع جديد
                </button>
              </div>
            )}
          </div>

          {/* Navigation Buttons - Show if projects exist */}
          {projects.length > 0 && (
            <>
              {/* Left Arrow */}
              <button
                onClick={() => scroll('left')}
                aria-label="المشروع السابق"
                className="absolute top-1/2 -left-4 transform -translate-y-1/2 bg-slate-800/80 backdrop-blur-sm rounded-full p-2.5 text-white hover:bg-purple-600 transition-all z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
              </button>
              {/* Right Arrow */}
              <button
                onClick={() => scroll('right')}
                aria-label="المشروع التالي"
                className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-slate-800/80 backdrop-blur-sm rounded-full p-2.5 text-white hover:bg-purple-600 transition-all z-10 opacity-0 group-hover:opacity-100 focus:opacity-100"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
              </button>
            </>
          )}
        </div>
      </section>
    );
  };

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
                             {isAdminView && <AdminButton onClick={() => handleDeleteComment(comment.id)} />}
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

  const SkillModal = ({ isOpen, onClose, onSave }: { isOpen: boolean; onClose: () => void; onSave: (skillName: string, iconName: string) => void }) => {
    const [skillName, setSkillName] = useState('');
    const [selectedIcon, setSelectedIcon] = useState(Object.keys(ICONS)[0]);

    if (!isOpen) return null;
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(skillName, selectedIcon);
        setSkillName('');
        setSelectedIcon(Object.keys(ICONS)[0]);
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-slate-800 border border-purple-600 rounded-xl p-8 shadow-lg shadow-purple-900/40 w-full max-w-md" onClick={e => e.stopPropagation()}>
                <h3 className="text-2xl font-bold text-cyan-300 mb-6 text-center">إضافة مهارة جديدة</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <input
                        type="text"
                        placeholder="اسم المهارة"
                        value={skillName}
                        onChange={(e) => setSkillName(e.target.value)}
                        className="w-full bg-slate-900 border border-purple-700 rounded-md p-3 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition"
                        autoFocus
                    />
                    <div>
                        <p className="text-purple-300 mb-3 text-center">اختر أيقونة:</p>
                        <div className="grid grid-cols-4 gap-4">
                            {Object.entries(ICONS).map(([key, IconComponent]) => (
                                <button
                                    type="button"
                                    key={key}
                                    onClick={() => setSelectedIcon(key)}
                                    className={`p-4 rounded-lg flex items-center justify-center transition-all ${selectedIcon === key ? 'bg-cyan-500/20 ring-2 ring-cyan-400' : 'bg-slate-700/50 hover:bg-purple-500/20'}`}
                                >
                                    <div className="w-8 h-8 text-slate-200">
                                        <IconComponent />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-4 pt-4">
                        <button type="button" onClick={onClose} className="w-full bg-slate-600 hover:bg-slate-500 font-bold py-3 px-4 rounded-lg transition-colors">
                            إلغاء
                        </button>
                        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-500 font-bold py-3 px-4 rounded-lg transition-colors">
                            حفظ المهارة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
  
  const filteredProjects = data.projects.filter(project =>
      project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-slate-900 min-h-screen text-slate-100 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]">
      <header className="p-4 sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-purple-800/50">
        <div className="container mx-auto flex justify-between items-center gap-4">
          <h1 className="text-lg sm:text-xl md:text-2xl font-bold font-orbitron text-cyan-400 whitespace-nowrap">ملف إنجاز: محمد</h1>
          
          <div className="relative flex-grow max-w-lg">
            <input 
              type="text"
              placeholder="ابحث عن مشروع..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800/60 border border-purple-700 rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-cyan-400 focus:outline-none transition placeholder:text-slate-400"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
              <SearchIcon />
            </div>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse">
            <span className="text-xs sm:text-sm hidden md:inline">{isAdminView ? 'واجهة الطالب' : 'واجهة الزائر'}</span>
            <label htmlFor="admin-toggle" className="flex items-center cursor-pointer">
              <div className="relative">
                <input id="admin-toggle" type="checkbox" className="sr-only peer" checked={isAdminView} onChange={() => setIsAdminView(!isAdminView)} />
                <div className="block bg-slate-700 w-14 h-8 rounded-full"></div>
                <div className="dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform transform peer-checked:translate-x-full peer-checked:bg-cyan-300"></div>
              </div>
            </label>
          </div>
        </div>
      </header>
      
      <SkillModal isOpen={isSkillModalOpen} onClose={() => setIsSkillModalOpen(false)} onSave={handleAddSkill} />

      <main className="container mx-auto p-4 md:p-8">
        <ProfileSection />
        <GenericSection listKey="achievements" title="إنجازاتي" />
        <ProjectsSection projects={filteredProjects} />
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
