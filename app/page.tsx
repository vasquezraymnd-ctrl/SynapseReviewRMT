'use client';
import React, { useState, useEffect, useMemo, createContext, useContext, ReactNode, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from '../lib/firebase';
import { useDropzone } from 'react-dropzone';
import {
    BarChart3, BookOpen, CheckCircle, ChevronDown, ClipboardCheck, Clock, Droplets, Edit, FileText, FlaskConical, 
    Home, Layers, Lock, LogOut, Maximize, Menu, Microscope, Moon, Play, Search, Shield, Sun, TestTube, Timer, 
    Upload, UserCircle, Video, XCircle, Bookmark, Beaker, HeartPulse, Bug, ShieldCheck, Pipette, BookImage,
    PanelLeftClose, PanelRightClose, AlertTriangle
} from 'lucide-react';
import Confetti from 'react-confetti';

// --- DYNAMIC ICON COMPONENT ---
const iconComponents = {
  Beaker,
  HeartPulse,
  Bug,
  ShieldCheck,
  Pipette,
  BookImage,
  // Old icons as fallback
  FlaskConical,
  Droplets,
  Microscope,
  Shield,
  TestTube,
  Layers
};

type IconName = keyof typeof iconComponents;

const DynamicIcon = ({ name, ...props }: { name: IconName; [key: string]: any }) => {
  const IconComponent = iconComponents[name];
  if (!IconComponent) {
    return null; // Silently fail if icon name is invalid
  }
  return <IconComponent {...props} />;
};

// --- LOCAL STORAGE HOOK (SSR/HYDRATION-SAFE) ---
function useStickyState<T>(defaultValue: T, key: string): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(defaultValue);

  useEffect(() => {
    const stickyValue = window.localStorage.getItem(key);
    if (stickyValue !== null) {
      try {
        setValue(JSON.parse(stickyValue));
      } catch(e) {
        console.error(`Error parsing localStorage key “${key}”:`, e);
        window.localStorage.setItem(key, JSON.stringify(defaultValue));
        setValue(defaultValue);
      }
    }
  }, [key, defaultValue]);

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// --- MOCK DATA & CONFIGURATION ---
type Question = {
    id: number;
    question: string;
    options: string[];
    answer: string;
    rationale: string;
};

type Module = {
    title: string;
    unlocked: boolean;
    content: { pdfs: number; videos: number };
    completed: boolean;
};

type Subject = {
    iconName: IconName;
    modulesCompleted: boolean;
    questions: Question[];
    modules: Module[];
};

type Subjects = {
    [key: string]: Subject;
};

const clinicalChemistryQuestions: Question[] = Array.from({ length: 100 }, (_, i) => ({
    id: i,
    question: `What is the significance of elevated cardiac troponin I (cTnI) in a patient presenting with chest pain? #${i + 1}`,
    options: [
        'Myocardial Infarction',
        'Stable Angina',
        'Pericarditis',
        'Pulmonary Embolism'
    ],
    answer: 'Myocardial Infarction',
    rationale: 'Cardiac troponins (cTnI and cTnT) are highly sensitive and specific biomarkers for myocardial injury, making them the gold standard for diagnosing Myocardial Infarction.'
}));

const initialSubjects: Subjects = {
    'Clinical Chemistry': {
        iconName: 'Beaker',
        modulesCompleted: true,
        questions: clinicalChemistryQuestions,
        modules: [
            { title: 'Module 1: Intro to CC', unlocked: true, content: { pdfs: 1, videos: 1 }, completed: true },
            { title: 'Module 2: Quality Control', unlocked: true, content: { pdfs: 2, videos: 1 }, completed: true },
            { title: 'Module 3: Carbohydrates', unlocked: true, content: { pdfs: 1, videos: 2 }, completed: true },
        ]
    },
    'Hematology': { iconName: 'HeartPulse', modulesCompleted: false, questions: [], modules: [] },
    'Microbiology': { iconName: 'Bug', modulesCompleted: false, questions: [], modules: [] },
    'ISBB': { iconName: 'ShieldCheck', modulesCompleted: false, questions: [], modules: [] },
    'Clinical Microscopy': { iconName: 'Pipette', modulesCompleted: false, questions: [], modules: [] },
    'Histopathology': { iconName: 'BookImage', modulesCompleted: false, questions: [], modules: [] },
};

const finalMockExamQuestions: Question[] = Array.from({ length: 100 }, (_, i) => ({
  id: i,
  question: `This is a comprehensive mock exam question #${i + 1}. Which of the following is a gram-positive bacterium?`,
  options: ['Staphylococcus aureus', 'Escherichia coli', 'Pseudomonas aeruginosa', 'Klebsiella pneumoniae'],
  answer: 'Staphylococcus aureus',
  rationale: 'Staphylococcus aureus is a classic example of a gram-positive cocci, often found on the skin and in the respiratory tract.'
}));

// --- THEME & APP CONTEXT ---
const AppContext = createContext<any>(null);
const AppProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useStickyState('dark', 'synapse-theme');
    const [user, setUser] = useStickyState<string | null>(null, 'synapse-user');
    const [subjects, setSubjects] = useStickyState<Subjects>(initialSubjects, 'synapse-subjects-v2');
    const [isFullScreen, setIsFullScreen] = useState(false);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
            if (document.exitFullscreen) document.exitFullscreen();
        }
    };
    
    useEffect(() => {
      const onFullScreenChange = () => setIsFullScreen(Boolean(document.fullscreenElement));
      document.addEventListener('fullscreenchange', onFullScreenChange);
      return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
    }, []);

    const colors = theme === 'light' 
        ? { bg: '#FFFFFF', card: '#F0F4F8', text: '#182B49', accent: '#0060F0', accent2: '#00A0F0', border: '#E0E7FF', shadow: 'rgba(0, 96, 240, 0.1)', input: '#FFFFFF', gradient: 'radial-gradient(circle at top left, #E0E7FF, #FFFFFF)', cardGradient: 'linear-gradient(135deg, #F0F4F8, #FFFFFF)'}
        : { bg: '#040815', card: '#101C33', text: '#E0E7FF', accent: '#00A0F0', accent2: '#0060F0', border: '#283A59', shadow: 'rgba(0, 160, 240, 0.15)', input: '#0F1A30', gradient: 'radial-gradient(circle at top left, #101C33, #040815)', cardGradient: 'linear-gradient(135deg, #182B49, #101C33)'};

    return <AppContext.Provider value={{ theme, toggleTheme, colors, user, setUser, isFullScreen, toggleFullScreen, subjects, setSubjects }}>{children}</AppContext.Provider>;
};
const useAppContext = () => useContext(AppContext);

// --- MAIN APP COMPONENT ---
export default function SynapseApp() {
    return (
        <AppProvider>
            <div className={`h-full w-full font-sans`}>
                <AppContainer />
            </div>
        </AppProvider>
    );
}

function AppContainer() {
    const { user, colors } = useAppContext();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
      document.body.style.background = colors.gradient;
      document.body.style.color = colors.text;
    }, [colors]);

    if (isLoading) {
        return <LoadingScreen onLoaded={() => setIsLoading(false)} />;
    }

    if (!user) return <LoginPage />;
    return <LmsLayout />;
}

// --- LOADING SCREEN ---
const LoadingScreen = ({ onLoaded }: { onLoaded: () => void }) => {
    const { colors } = useAppContext();

    useEffect(() => {
        const timer = setTimeout(() => {
            onLoaded();
        }, 1300); // 1.3-second loading time

        return () => clearTimeout(timer);
    }, [onLoaded]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: colors.gradient }}>
            <div className="text-center">
                 <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-wider relative" style={{ color: colors.text }}>
                    SYNAPSE
                    <div className="absolute right-[-1.5rem] md:right-[-2rem] top-1/2 -translate-y-1/2 w-3 h-3 md:w-5 md:h-5">
                        <div style={{ backgroundColor: colors.accent }} className="absolute w-full h-full rounded-full animate-ping"></div>
                        <div style={{ backgroundColor: colors.accent }} className="absolute w-full h-full rounded-full"></div>
                    </div>
                </h1>
                <p className="text-md md:text-lg opacity-75 mt-4">Next-Gen Review for Next-Gen RMTs</p>
            </div>
        </div>
    );
};


// --- 1. LOGIN SYSTEM (SPOTIFY-THEMED) ---
const LoginPage = () => {
    const { colors, setUser, toggleTheme, theme } = useAppContext();
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: colors.gradient}}>
            <div className="absolute top-5 right-5">
                <button onClick={toggleTheme} className="p-3 rounded-full transition-all hover:scale-110" style={{ backgroundColor: colors.card, color: colors.accent, boxShadow: `0 4px 15px ${colors.shadow}` }}>
                    {theme === 'light' ? <Moon size={20}/> : <Sun size={20}/>}
                </button>
            </div>
            <div className="text-center mb-12">
                 <h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-wider relative" style={{color: colors.text}}>
                    SYNAPSE
                    <div className="absolute right-[-1.5rem] md:right-[-2rem] top-1/2 -translate-y-1/2 w-3 h-3 md:w-5 md:h-5">
                        <div style={{backgroundColor: colors.accent}} className="absolute w-full h-full rounded-full animate-ping"></div>
                        <div style={{backgroundColor: colors.accent}} className="absolute w-full h-full rounded-full"></div>
                    </div>
                </h1>
            </div>
            <div className="w-full max-w-sm p-8 rounded-3xl" style={{ background: `linear-gradient(145deg, ${colors.card}, ${colors.bg})`, boxShadow: `0 12px 64px ${colors.shadow}` }}>
                <h2 className="text-4xl font-bold text-center mb-8">Log In</h2>
                <div className="space-y-6">
                    <input type="email" placeholder="Email Address" className="w-full p-4 border rounded-xl bg-transparent transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent" style={{borderColor: colors.border, outline: 'none', '--tw-ring-color': colors.accent} as React.CSSProperties} />
                    <input type="password" placeholder="Password" className="w-full p-4 border rounded-xl bg-transparent transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent" style={{borderColor: colors.border, outline: 'none', '--tw-ring-color': colors.accent} as React.CSSProperties}/>
                </div>
                <div className="my-8">
                    <button onClick={() => setUser('student')} className="w-full py-4 font-bold text-white rounded-xl transition-transform hover:scale-105 shadow-lg" style={{backgroundColor: colors.accent, boxShadow: `0 8px 32px rgba(0, 160, 240, 0.4)`}}>
                      Continue
                    </button>
                </div>
                <div className="space-y-4 text-center">
                   <button onClick={() => setUser('admin')} className="font-bold transition-colors hover:text-white" style={{color: colors.accent}}>
                     Login as Admin
                   </button>
                </div>
            </div>
        </div>
    );
};

// --- 2. LMS LAYOUT & NEW BOTTOM NAVIGATION ---
const LmsLayout = () => {
    const { colors, user } = useAppContext();
    const [activePage, setActivePage] = useState('Dashboard');

    const renderPage = () => {
        if (user === 'admin') {
            switch(activePage) {
                case 'Dashboard': return <h1 className='text-4xl font-bold p-6'>Admin Dashboard</h1>;
                case 'Content Manager': return <ContentManager />;
                case 'Analytics': return <h1 className='text-4xl font-bold p-6'>Class Analytics</h1>;
                case 'Account': return <AccountPage />;
                default: return <h1 className='text-4xl font-bold p-6'>Admin Dashboard</h1>;
            }
        }
        switch(activePage) {
            case 'Dashboard': return <StudentDashboard />;
            case 'My Courses': return <StudentModules />;
            case 'Assessments': return <AssessmentHub />;
            case 'Account': return <AccountPage />;
            default: return <StudentDashboard />;
        }
    }

    return (
        <div className="w-full h-screen flex flex-col" style={{ background: colors.gradient}}>
            <div className="flex-grow overflow-y-auto pb-28">
                {renderPage()}
            </div>
            <BottomNavBar activePage={activePage} setActivePage={setActivePage} />
        </div>
    );
};

const BottomNavBar = ({ activePage, setActivePage }: { activePage: string; setActivePage: (page: string) => void }) => {
    const { colors, user } = useAppContext();
    const studentItems = { 'Dashboard': <Home />, 'My Courses': <BookOpen />, 'Assessments': <ClipboardCheck />, 'Account': <UserCircle /> };
    const adminItems = { 'Dashboard': <Home />, 'Content Manager': <Upload />, 'Analytics': <BarChart3 />, 'Account': <UserCircle /> };
    const navItems = user === 'student' ? studentItems : adminItems;

    return (
        <nav className="fixed bottom-0 left-0 right-0 py-2 border-t flex justify-around items-start" style={{ background: colors.bg, borderColor: colors.border}}>
            {Object.entries(navItems).map(([name, icon]) => (
                <button 
                    key={name} 
                    onClick={() => setActivePage(name)} 
                    className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24 ${activePage === name ? '' : 'opacity-60'}`}>
                    <div style={{color: activePage === name ? colors.accent : colors.text}}>{icon}</div>
                    <span className="text-xs font-semibold" style={{color: activePage === name ? colors.accent : colors.text}}>{name}</span>
                </button>
            ))}
        </nav>
    );
};

// --- NEW ACCOUNT PAGE ---
const AccountPage = () => {
    const { colors, user, setUser, theme, toggleTheme } = useAppContext();
    return (
        <div className="p-6">
            <h1 className="text-4xl font-bold mb-8">Account</h1>
            <div className="p-6 rounded-2xl shadow-xl space-y-6" style={{ backgroundColor: colors.card }}>
                 <div className="flex items-center gap-4">
                    <UserCircle size={48} style={{color: colors.accent}}/>
                    <div>
                        <p className='text-2xl font-bold capitalize'>{user}</p>
                        <p className='opacity-60'>View Profile</p>
                    </div>
                </div>
                <div className='flex justify-between items-center'>
                    <p className="font-semibold">Theme</p>
                    <button onClick={toggleTheme} className="p-3 rounded-full flex items-center gap-2 font-semibold" style={{ backgroundColor: colors.input, color: colors.text }}>
                        {theme === 'light' ? <><Moon size={20}/> Light</> : <><Sun size={20}/> Dark</>}
                    </button>
                </div>
                <button onClick={() => setUser(null)} className="w-full py-3 font-bold text-red-500 rounded-lg" style={{backgroundColor: colors.input}}>
                    Log Out
                </button>
            </div>
        </div>
    );
}

// --- 3. REDESIGNED STUDENT DASHBOARD ---
const StudentDashboard = () => {
    const { subjects } = useAppContext();
    const [greeting, setGreeting] = useState('');
    const [mounted, setMounted] = useState(false);
    useEffect(() => setMounted(true), []);

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour < 12) setGreeting('Good morning');
        else if (hour < 18) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    if (!mounted) {
        return null; // Or a loading spinner
    }

    return (
        <div className='p-6'>
            <h1 className="text-4xl font-extrabold mb-8" suppressHydrationWarning>{greeting}</h1>
            
            <h2 className="text-2xl font-bold mb-4">Continue Studying</h2>
            <ContinueStudyingCard />

            <h2 className="text-2xl font-bold mt-8 mb-4">All Subjects</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                 {Object.entries(subjects).map(([name, data]) => (
                    <SubjectCard key={name} name={name} data={data as Subject} />
                ))}
            </div>
        </div>
    );
};

const ContinueStudyingCard = () => {
    const { colors, subjects } = useAppContext();
    const subjectName = 'Clinical Chemistry';
    const subjectData = subjects[subjectName];
    if (!subjectData) return null;

    return (
         <div className="group rounded-2xl shadow-lg flex items-center gap-4 p-4 transition-all hover:scale-102" style={{ background: colors.cardGradient, boxShadow: `0 8px 32px ${colors.shadow}`}}>
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full" style={{background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`, color: 'white', boxShadow: `0 6px 20px ${colors.shadow}`}}>
                <DynamicIcon name={subjectData.iconName} size={48} />
            </div>
            <div className="flex-grow">
                 <p className='text-sm opacity-80 mb-1'>UP NEXT</p>
                <h3 className="text-xl font-bold">{subjectName}</h3>
                <p className='text-sm opacity-60'>Module 2: Quality Control</p>
            </div>
             <button className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110" style={{backgroundColor: colors.accent, color: 'white'}}>
                <Play size={32}/>
            </button>
        </div>
    )
}

const SubjectCard = ({ name, data }: { name: string; data: Subject }) => {
    const { colors } = useAppContext();
    return (
        <div className="group rounded-2xl shadow-lg overflow-hidden relative p-4 flex flex-col justify-between transition-all hover:scale-105 hover:shadow-2xl" style={{ background: colors.card, minHeight: '220px' }}>
            <div className="flex-grow flex items-center justify-center">
                <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`, color: 'white', boxShadow: `0 6px 20px ${colors.shadow}` }}>
                     <DynamicIcon name={data.iconName} size={48} />
                </div>
            </div>
            <h3 className="text-md font-bold mt-4 text-center">{name}</h3>
            <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl" style={{backgroundColor: colors.accent, color: 'white'}}>
                <Play />
            </button>
        </div>
    );
};


// --- MODULES & ASSESSMENTS ---
const StudentModules = () => {
    const { colors, subjects } = useAppContext();
    const [openSubject, setOpenSubject] = useState<string | null>('Clinical Chemistry');

    return(
        <div className='p-6'>
            <h1 className="text-4xl font-extrabold mb-8">My Courses</h1>
            <div className="space-y-4">
                {Object.entries(subjects).map(([name, data]) => (
                    <div key={name} className="rounded-2xl overflow-hidden shadow-lg" style={{ backgroundColor: colors.card}}>
                        <button onClick={() => setOpenSubject(openSubject === name ? null : name)} className="w-full flex justify-between items-center p-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`, color: 'white'}}>
                                    <DynamicIcon name={(data as Subject).iconName} size={20} />
                                </div>
                                <span className="font-bold text-lg">{name}</span>
                            </div>
                            <ChevronDown className={`transition-transform ${openSubject === name ? '' : '-rotate-90'}`}/>
                        </button>
                        {openSubject === name && (
                            <div className="p-4 border-t" style={{borderColor: colors.border}}>
                                {(data as Subject).modules.length > 0 ? (data as Subject).modules.map(mod => <ModuleItem key={mod.title} module={mod} subjectName={name} />) : <p className="text-center opacity-60 py-4">Modules coming soon!</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

const ModuleItem = ({ module, subjectName }: { module: Module; subjectName: string }) => {
    const { colors, setSubjects } = useAppContext();
    
    const toggleModuleCompletion = () => {
        setSubjects((prevSubjects: Subjects) => {
            const newSubjects = JSON.parse(JSON.stringify(prevSubjects));
            const subject = newSubjects[subjectName];
            if (subject) {
                const moduleIndex = subject.modules.findIndex((m: Module) => m.title === module.title);
                if (moduleIndex !== -1) {
                    subject.modules[moduleIndex].completed = !subject.modules[moduleIndex].completed;
                    subject.modulesCompleted = subject.modules.every((m: Module) => m.completed);
                }
            }
            return newSubjects;
        });
    }

    return (
        <div className={`p-4 rounded-lg mb-2 flex items-center justify-between transition-opacity ${!module.unlocked && 'opacity-50'}`}>
            <div className="flex items-center gap-4">
                <button onClick={toggleModuleCompletion} disabled={!module.unlocked} className="cursor-pointer">
                    {module.completed ? <CheckCircle className="text-green-500"/> : <div className="w-6 h-6 rounded-full border-2" style={{borderColor: colors.border}}></div>}
                </button>
                <div>
                    <p className="font-semibold">{module.title}</p>
                    <div className="flex gap-4 text-sm opacity-60">
                        {module.content.pdfs && <span className="flex items-center gap-1"><FileText size={14}/>{module.content.pdfs} PDF(s)</span>}
                        {module.content.videos && <span className="flex items-center gap-1"><Video size={14}/>{module.content.videos} Video(s)</span>}
                    </div>
                </div>
            </div>
            {module.unlocked ? <button className="p-2 rounded-full hover:opacity-80" style={{backgroundColor: colors.input}}><Search size={20}/></button> : <Lock/>}
        </div>
    );
}

const AssessmentHub = () => {
    const { colors, subjects } = useAppContext();
    const [quizState, setQuizState] = useState({ inQuiz: false, questions: [] as Question[], title: ''});
    const allSubjectsCompleted = useMemo(() => (Object.values(subjects) as Subject[]).every(s => s.modulesCompleted), [subjects]);

    if (quizState.inQuiz) return <QuizEngine questions={quizState.questions} title={quizState.title} onFinish={() => setQuizState({ inQuiz: false, questions: [], title: '' })} />;

    const startPracticeTest = (subjectName: string) => {
        const subject = subjects[subjectName];
        if (subject && subject.questions.length > 0) {
            setQuizState({ inQuiz: true, questions: subject.questions, title: `${subjectName} Practice Exam` });
        }
    };

    const startFinalExam = () => {
        setQuizState({ inQuiz: true, questions: finalMockExamQuestions, title: 'Final Mock Exam' });
    }

    return (
        <div className='p-6'>
            <h1 className="text-4xl font-extrabold mb-8">Assessments</h1>
             <button 
                onClick={startFinalExam}
                disabled={!allSubjectsCompleted}
                className="w-full p-8 text-left text-2xl font-bold text-white rounded-2xl transition-all hover:scale-102 shadow-2xl mb-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                    background: allSubjectsCompleted ? `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})` : colors.card,
                    color: allSubjectsCompleted ? 'white' : colors.text
                }}
            >
                <div className="flex justify-between items-center">
                    <div>
                        Final Mock Exam
                        <p className="text-sm font-normal opacity-80 mt-2">{allSubjectsCompleted ? 'You are ready for the final challenge!' : 'Complete all subject assessments to unlock.'}</p>
                    </div>
                    {!allSubjectsCompleted && <Lock size={40} />}
                </div>
            </button>

            <h2 className="text-2xl font-bold mb-4">Practice Assessments</h2>
            <div className="space-y-4">
                {Object.entries(subjects).map(([name, data]) => (
                    <AssessmentItem key={name} name={name} data={data as Subject} onStart={() => startPracticeTest(name)} />
                ))}
            </div>
        </div>
    );
}

const AssessmentItem = ({ name, data, onStart }: { name: string; data: Subject; onStart: () => void }) => {
    const { colors } = useAppContext();
    const isLocked = !data.modulesCompleted;

    return (
        <button
            onClick={onStart}
            disabled={isLocked}
            className="w-full p-4 rounded-2xl shadow-lg flex items-center gap-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102"
            style={{ background: colors.cardGradient, boxShadow: `0 8px 32px ${colors.shadow}` }}
        >
            <div className="relative w-16 h-16 flex items-center justify-center rounded-full flex-shrink-0" style={{background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`, color: 'white'}}>
                 <DynamicIcon name={data.iconName} size={32} />
            </div>
            <div className="flex-grow text-left">
                <h3 className="text-lg font-bold">{name}</h3>
                <p className="text-sm opacity-60">{isLocked ? 'Complete all modules to unlock' : (data.questions.length > 0 ? `${data.questions.length}-item quiz` : 'Coming Soon')}</p>
            </div>
            {isLocked ? (
                <Lock size={32} className="opacity-50" />
            ) : (
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor: colors.accent, color: 'white'}}>
                    <Play />
                </div>
            )}
        </button>
    );
};

const QuizEngine = ({ questions, title, onFinish }: { questions: Question[]; title: string; onFinish: () => void }) => {
    const { colors, toggleFullScreen, isFullScreen } = useAppContext();
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<(string | null)[]>(() => Array(questions.length).fill(null));
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [bookmarks, setBookmarks] = useState<boolean[]>(() => Array(questions.length).fill(false));
    const [timeLeft, setTimeLeft] = useState(questions.length * 72); // 1.2 min per question
    const [showResult, setShowResult] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [reviewMode, setReviewMode] = useState(false);
    const [showExitConfirm, setShowExitConfirm] = useState(false);
    const [isPanelVisible, setIsPanelVisible] = useState(true);

    useEffect(() => {
        if (!isFullScreen) toggleFullScreen();
        const timer = setInterval(() => setTimeLeft(t => t > 0 ? t-1 : 0), 1000);
        return () => {
             clearInterval(timer);
             if(document.fullscreenElement) toggleFullScreen();
        };
    }, []);

    const handleAnswer = () => { 
        if (selectedOption === null) return;
        const newAns = [...answers]; 
        newAns[current] = selectedOption; 
        setAnswers(newAns); 
        setSelectedOption(null);
        if(current < questions.length - 1) {
            setCurrent(current + 1); 
        } else { 
            setShowResult(true); 
            checkScore(newAns); 
        }
    };
    
    const toggleBookmark = () => {
        const newBookmarks = [...bookmarks];
        newBookmarks[current] = !newBookmarks[current];
        setBookmarks(newBookmarks);
    }

    const checkScore = (finalAnswers: (string | null)[]) => {
        const score = finalAnswers.reduce((acc, ans, i) => acc + (ans === questions[i].answer ? 1 : 0), 0);
        if (Math.round(score/questions.length*100) >= 75) { setShowConfetti(true); setTimeout(() => setShowConfetti(false), 8000); }
    };

    if(showResult) {
        const score = answers.reduce((acc, ans, i) => acc + (ans === questions[i].answer ? 1 : 0), 0);
        const percentage = Math.round(score/questions.length*100);
        
        if (reviewMode) {
            return <ReviewMode questions={questions} answers={answers} onExit={() => setReviewMode(false)} />
        }

        return (
            <div className="p-8 text-center flex flex-col items-center justify-center h-full">
                {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} colors={[colors.accent, colors.accent2, '#FFFFFF']} />}
                <div className={`p-8 rounded-2xl shadow-2xl w-full max-w-md`} style={{backgroundColor: colors.card}}>
                    <h2 className={`text-4xl font-bold ${percentage >= 75 ? 'text-green-400' : 'text-red-400'}`}>{percentage >= 75 ? 'Congratulations!' : 'Review Needed'}</h2>
                    <p className="text-7xl font-bold my-6" style={{color: colors.accent}}>{percentage}%</p>
                    <p className="text-xl mb-8">You got {score} out of {questions.length} questions correct.</p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => setReviewMode(true)} className="py-3 px-6 text-white rounded-lg font-semibold" style={{backgroundColor: colors.accent}}>Review Answers</button>
                        <button onClick={onFinish} className="py-3 px-6 rounded-lg font-semibold" style={{backgroundColor: colors.input}}>Back to Hub</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col md:flex-row absolute inset-0 z-10`} style={{ background: colors.gradient }}>
             {showExitConfirm && (
                <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20">
                    <div className="p-8 rounded-2xl shadow-lg w-full max-w-sm" style={{backgroundColor: colors.card}}>
                        <AlertTriangle className="text-red-500 mx-auto mb-4" size={48} />
                        <h2 className="text-2xl font-bold text-center mb-4">Exit Assessment?</h2>
                        <p className="text-center opacity-70 mb-8">Your progress will be saved, but the timer will continue to run. Are you sure you want to exit?</p>
                        <div className="flex justify-around">
                            <button onClick={() => setShowExitConfirm(false)} className="py-3 px-8 rounded-lg font-semibold" style={{backgroundColor: colors.input}}>Cancel</button>
                            <button onClick={onFinish} className="py-3 px-8 bg-red-600 text-white rounded-lg font-semibold">Exit</button>
                        </div>
                    </div>
                </div>
            )}
            {isPanelVisible && (
                <div className="w-full md:w-80 p-4 border-b md:border-r overflow-y-auto transition-all duration-300" style={{borderColor: colors.border}}>
                    <div className={`flex items-center justify-center gap-2 p-3 font-bold rounded-lg mb-4 text-white text-lg ${timeLeft < 300 ? 'bg-red-500 animate-pulse' : ''}`} style={{backgroundColor: timeLeft >=300 ? colors.accent2 : ''}}><Timer/><span>{`${Math.floor(timeLeft/60)}:${('0'+timeLeft%60).slice(-2)}`}</span></div>
                    <h2 className="text-xl font-bold mb-4 px-2">{title}</h2>
                    <div className="grid grid-cols-5 gap-2">
                        {Array.from({length: questions.length}).map((_,i) => (
                            <button key={i} onClick={() => setCurrent(i)} className={`relative w-full h-12 text-md font-semibold rounded-lg ring-2 ${answers[i] !== null ? 'opacity-70' : ''}`}
                            style={{
                                backgroundColor: answers[i] !== null ? '#2ECC71' : colors.input,
                                [ '--tw-ring-color' as any]: colors.accent
                            }}
                            >
                                {i+1}
                                {bookmarks[i] && <Bookmark size={12} className="absolute top-1 right-1" style={{color: colors.accent}} fill={colors.accent}/>}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="flex-1 p-6 md:p-10 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                         <button onClick={() => setIsPanelVisible(!isPanelVisible)} className={`p-2 rounded-full hover:opacity-80`} style={{backgroundColor: colors.input}}>
                            {isPanelVisible ? <PanelLeftClose /> : <PanelRightClose />}
                        </button>
                        <p className="opacity-60">Question {current + 1} of {questions.length}</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={() => setShowExitConfirm(true)} className={`p-2 rounded-full hover:opacity-80`} style={{backgroundColor: colors.input}}><XCircle className="text-red-500"/></button>
                        <button onClick={toggleBookmark} className={`p-2 rounded-full hover:opacity-80 ${bookmarks[current] ? '' : 'opacity-60'}`} style={{backgroundColor: colors.input}}><Bookmark style={{color: bookmarks[current] ? colors.accent : colors.text, fill: bookmarks[current] ? colors.accent : 'transparent'}}/></button>
                        <button className="p-2 rounded-full hover:opacity-80 opacity-60" style={{backgroundColor: colors.input}} onClick={toggleFullScreen}><Maximize/></button>
                    </div>
                </div>
                <h2 className="text-3xl font-semibold mb-8 flex-grow">{questions[current].question}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {questions[current].options.map(opt => <button key={opt} onClick={() => setSelectedOption(opt)} className={`p-5 text-left rounded-xl text-lg transition-colors border-2 ${selectedOption === opt ? 'border-sky-500' : ''}`} style={{backgroundColor: colors.card, borderColor: selectedOption === opt ? colors.accent : colors.border}}>{opt}</button>)}
                </div>
                 <div className="mt-8 text-right">
                    <button onClick={handleAnswer} disabled={selectedOption === null} className="py-3 px-8 rounded-lg font-semibold text-white disabled:opacity-50" style={{backgroundColor: colors.accent}}>Submit</button>
                </div>
            </div>
        </div>
    );
}

const ReviewMode = ({ questions, answers, onExit }: { questions: Question[]; answers: (string | null)[]; onExit: () => void }) => {
    const { colors } = useAppContext();
    return (
        <div className="p-4 md:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Review</h1>
                <button onClick={onExit} className="py-2 px-4 rounded-lg font-semibold" style={{backgroundColor: colors.input}}>Exit Review</button>
            </div>
            <div className="space-y-6">
                {questions.map((q, i) => {
                    const userAnswer = answers[i];
                    const isCorrect = userAnswer === q.answer;
                    return (
                        <div key={q.id} className="p-4 rounded-lg shadow-md" style={{backgroundColor: colors.card, borderLeft: `4px solid ${isCorrect ? '#2ECC71' : '#E74C3C'}`}}>
                            <p className="font-bold mb-2 text-lg">{i+1}. {q.question}</p>
                            <p className={`${isCorrect ? 'text-green-400' : 'text-red-400'}`}>Your answer: <span className="font-semibold">{userAnswer || 'Not Answered'}</span></p>
                            {!isCorrect && <p className="text-green-400">Correct Answer: <span className="font-semibold">{q.answer}</span></p>}
                            <p className="text-sm opacity-60 mt-2">{q.rationale}</p>
                        </div>
                    )
                })}
            </div>
        </div>
    );
}


// --- ADMIN / TEACHER'S LOUNGE ---
const ContentManager = () => {
    const { colors, subjects, setSubjects } = useAppContext();
    const [selectedSubject, setSelectedSubject] = useState(Object.keys(subjects)[0]);
    const [questionJson, setQuestionJson] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [file, setFile] = useState<File | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
      }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({onDrop, accept: {'application/pdf': ['.pdf'], 'video/mp4': ['.mp4']}});

    useEffect(() => {
        if (subjects[selectedSubject]) {
            setQuestionJson(JSON.stringify(subjects[selectedSubject].questions, null, 2));
        }
    }, [selectedSubject, subjects]);

    const handleSubjectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSubject(e.target.value);
    }

    const handleQuestionUpdate = () => {
        try {
            const updatedQuestions = JSON.parse(questionJson);
            setSubjects((prevSubjects: Subjects) => ({
                ...prevSubjects,
                [selectedSubject]: {
                    ...prevSubjects[selectedSubject],
                    questions: updatedQuestions
                }
            }));
            alert(`${selectedSubject} question bank updated!`);
        } catch (e) {
            alert('Error: Invalid JSON format.');
        }
    }

    const handleFileUpload = () => {
      if (!file) return;
      setUploading(true);
      const storageRef = ref(storage, `${selectedSubject}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("Upload failed", error);
          alert("Upload failed!");
          setUploading(false);
        }, 
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            console.log('File available at', downloadURL);
            alert('File uploaded successfully!');
            setUploading(false);
            setFile(null);
          });
        }
      );
    };

    return (
        <div className='p-6'>
             <h1 className="text-4xl font-extrabold mb-8">Content Manager</h1>
             
             <div className="mb-8">
                <label htmlFor="subject-select" className="block text-lg font-semibold mb-2">Select Subject to Edit</label>
                <select 
                    id="subject-select"
                    value={selectedSubject}
                    onChange={handleSubjectChange}
                    className="w-full p-4 rounded-xl border transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
                    style={{borderColor: colors.border, backgroundColor: colors.input, '--tw-ring-color': colors.accent} as React.CSSProperties}
                >
                    {Object.keys(subjects).map(name => <option key={name} value={name}>{name}</option>)}
                </select>
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl space-y-4 shadow-lg" style={{ backgroundColor: colors.card}}>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Upload/> Upload Course Materials</h2>
                     <p className="opacity-60 text-sm">Upload PDFs and videos for the modules in <span className="font-bold">{selectedSubject}</span>.</p>
                    <div {...getRootProps()} className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer hover:border-sky-500 transition-colors ${isDragActive ? 'border-sky-500' : ''}`} style={{borderColor: colors.border}}>
                        <input {...getInputProps()} />
                        <Upload className="mx-auto opacity-40 mb-2" size={48}/>
                        { isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop some files here, or click to select files</p>}
                        <p className="text-sm opacity-60">PDFs or Videos</p>
                    </div>
                    {file && (
                      <div className="mt-4">
                        <p>Selected file: {file.name}</p>
                        <button onClick={handleFileUpload} disabled={uploading} className="w-full py-2 mt-2 font-bold text-white rounded-lg" style={{backgroundColor: colors.accent}}>
                          {uploading ? `Uploading... ${uploadProgress.toFixed(0)}%` : 'Upload File'}
                        </button>
                      </div>
                    )}
                </div>
                 <div className="p-6 rounded-2xl space-y-4 shadow-lg" style={{ backgroundColor: colors.card}}>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Edit/> Question Lab</h2>
                    <p className="opacity-60 text-sm">Edit the JSON for the <span className="font-bold">{selectedSubject}</span> practice exam.</p>
                     <textarea 
                        className="w-full h-60 p-3 bg-transparent border-2 rounded-lg font-mono text-sm" 
                        placeholder={`Paste JSON array of questions for ${selectedSubject}...`}
                        value={questionJson}
                        onChange={(e) => setQuestionJson(e.target.value)}
                        style={{borderColor: colors.border}}
                    />
                     <button onClick={handleQuestionUpdate} className="w-full py-3 font-bold text-white rounded-lg" style={{backgroundColor: colors.accent}}>Update {selectedSubject} Questions</button>
                </div>
             </div>
        </div>
    )
}
