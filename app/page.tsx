'use client';
import React, { useState, useEffect, useMemo, createContext, useContext, ReactNode, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
    BarChart3, BookOpen, CheckCircle, ChevronDown, ClipboardCheck, Clock, Droplets, Edit, FileText, FlaskConical, 
    Home, Layers, Lock, LogOut, Maximize, Menu, Microscope, Moon, Play, Search, Shield, Sun, TestTube, Timer, 
    Upload, UserCircle, Video, XCircle, Bookmark, Beaker, HeartPulse, Bug, ShieldCheck, Pipette, BookImage,
    PanelLeftClose, PanelRightClose, AlertTriangle
} from 'lucide-react';
import Confetti from 'react-confetti';
import { IconName, File, Question, Module, Subject, Subjects } from './types';
import { getSubjects, getSubjectQuestions, updateModuleCompletion, getUserProgress, handleLocalUploadAndUpdate, updateSubjectQuestions } from './actions';


// --- DYNAMIC ICON COMPONENT ---
const iconComponents = {
  Beaker, HeartPulse, Bug, ShieldCheck, Pipette, BookImage, FlaskConical, Droplets, Microscope, Shield, TestTube, Layers
};
const DynamicIcon = ({ name, ...props }: { name: IconName; [key: string]: any }) => {
  const IconComponent = iconComponents[name];
  if (!IconComponent) return null;
  return <IconComponent {...props} />;
};

// --- THEME & APP CONTEXT ---
const AppContext = createContext<any>(null);
const AppProvider = ({ children }: { children: ReactNode }) => {
    const [theme, setTheme] = useState('dark');
    const [user, setUser] = useState<string | null>(null);
    const [subjects, setSubjects] = useState<Subjects>({});
    const [userProgress, setUserProgress] = useState<any>({});
    const [isFullScreen, setIsFullScreen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [initialLoad, setInitialLoad] = useState(true);

    useEffect(() => {
        const stickyTheme = window.localStorage.getItem('synapse-theme');
        if (stickyTheme) setTheme(JSON.parse(stickyTheme));
        const stickyUser = window.localStorage.getItem('synapse-user');
        if (stickyUser) setUser(JSON.parse(stickyUser));
        setInitialLoad(false);
    }, []);

    useEffect(() => {
        if (!initialLoad) {
            window.localStorage.setItem('synapse-theme', JSON.stringify(theme));
            if (user) window.localStorage.setItem('synapse-user', JSON.stringify(user));
            else window.localStorage.removeItem('synapse-user');
        }
    }, [theme, user, initialLoad]);
    
    useEffect(() => {
        if (initialLoad) return;
        async function loadData() {
            setLoading(true);
            const [subjectsData, progressData] = await Promise.all([
                getSubjects(),
                user ? getUserProgress(user) : Promise.resolve({})
            ]);
            setSubjects(subjectsData);
            setUserProgress(progressData);
            setLoading(false);
        }
        loadData();
    }, [user, initialLoad]);

    const forceReloadSubjects = useCallback(async () => {
        setLoading(true);
        const subjectsData = await getSubjects();
        setSubjects(subjectsData);
        setLoading(false);
    }, []);

    const toggleTheme = () => setTheme(t => t === 'light' ? 'dark' : 'light');
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(console.log);
        else if (document.exitFullscreen) document.exitFullscreen();
    };
    
    useEffect(() => {
      const onFullScreenChange = () => setIsFullScreen(Boolean(document.fullscreenElement));
      document.addEventListener('fullscreenchange', onFullScreenChange);
      return () => document.removeEventListener('fullscreenchange', onFullScreenChange);
    }, []);

    const colors = theme === 'light' 
        ? { bg: '#FFFFFF', card: '#F0F4F8', text: '#182B49', accent: '#0060F0', accent2: '#00A0F0', border: '#E0E7FF', shadow: 'rgba(0, 96, 240, 0.1)', input: '#FFFFFF', gradient: 'radial-gradient(circle at top left, #E0E7FF, #FFFFFF)', cardGradient: 'linear-gradient(135deg, #F0F4F8, #FFFFFF)'}
        : { bg: '#040815', card: '#101C33', text: '#E0E7FF', accent: '#00A0F0', accent2: '#0060F0', border: '#283A59', shadow: 'rgba(0, 160, 240, 0.15)', input: '#0F1A30', gradient: 'radial-gradient(circle at top left, #101C33, #040815)', cardGradient: 'linear-gradient(135deg, #182B49, #101C33)'};

    return <AppContext.Provider value={{ theme, toggleTheme, colors, user, setUser, isFullScreen, toggleFullScreen, subjects, userProgress, loading, setUserProgress, forceReloadSubjects }}>{children}</AppContext.Provider>;
};
const useAppContext = () => useContext(AppContext);

// --- MAIN APP COMPONENT & CONTAINER ---
export default function SynapseApp() {
    return (
        <AppProvider>
            <div className={`h-full w-full font-sans`}><AppContainer /></div>
        </AppProvider>
    );
}

function AppContainer() {
    const { user, colors, loading, initialLoad } = useAppContext();
    useEffect(() => {
      document.body.style.background = colors.gradient;
      document.body.style.color = colors.text;
    }, [colors]);

    if (loading || initialLoad) return <LoadingScreen />;
    if (!user) return <LoginPage />;
    return <LmsLayout />;
}

// --- LOADING & LOGIN PAGES (UNCHANGED) ---
const LoadingScreen=()=> { const {colors}=useAppContext(); return <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{background:colors.gradient}}><div className="text-center"><h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-wider relative" style={{color:colors.text}}>SYNAPSE<div className="absolute right-[-1.5rem] md:right-[-2rem] top-1/2 -translate-y-1/2 w-3 h-3 md:w-5 md:h-5"><div style={{backgroundColor:colors.accent}} className="absolute w-full h-full rounded-full animate-ping"></div><div style={{backgroundColor:colors.accent}} className="absolute w-full h-full rounded-full"></div></div></h1><p className="text-md md:text-lg opacity-75 mt-4">Next-Gen review for Next-Gen RMTs</p></div></div>; };
const LoginPage=()=> { const {colors,setUser,toggleTheme,theme}=useAppContext(); return <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{background:colors.gradient}}><div className="absolute top-5 right-5"><button onClick={toggleTheme} className="p-3 rounded-full transition-all hover:scale-110" style={{backgroundColor:colors.card,color:colors.accent,boxShadow:`0 4px 15px ${colors.shadow}`}}>{theme==='light'?<Moon size={20}/>:<Sun size={20}/>}</button></div><div className="text-center mb-12"><h1 className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-wider relative" style={{color:colors.text}}>SYNAPSE<div className="absolute right-[-1.5rem] md:right-[-2rem] top-1/2 -translate-y-1/2 w-3 h-3 md:w-5 md:h-5"><div style={{backgroundColor:colors.accent}} className="absolute w-full h-full rounded-full animate-ping"></div><div style={{backgroundColor:colors.accent}} className="absolute w-full h-full rounded-full"></div></div></h1></div><div className="w-full max-w-sm p-8 rounded-3xl" style={{background:`linear-gradient(145deg, ${colors.card}, ${colors.bg})`,boxShadow:`0 12px 64px ${colors.shadow}`}}><h2 className="text-4xl font-bold text-center mb-8">Log In</h2><div className="space-y-6"><input type="email" placeholder="Email Address" className="w-full p-4 border rounded-xl bg-transparent transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent" style={{borderColor:colors.border,outline:'none','--tw-ring-color':colors.accent} as React.CSSProperties}/><input type="password" placeholder="Password" className="w-full p-4 border rounded-xl bg-transparent transition-all focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent" style={{borderColor:colors.border,outline:'none','--tw-ring-color':colors.accent} as React.CSSProperties}/></div><div className="my-8"><button onClick={()=>setUser('student')} className="w-full py-4 font-bold text-white rounded-xl transition-transform hover:scale-105 shadow-lg" style={{backgroundColor:colors.accent,boxShadow:`0 8px 32px rgba(0, 160, 240, 0.4)`}}>Continue</button></div><div className="space-y-4 text-center"><button onClick={()=>setUser('admin')} className="font-bold transition-colors hover:text-white" style={{color:colors.accent}}>Login as Admin</button></div></div></div>; };


// --- LMS LAYOUT & NAVIGATION (UNCHANGED) ---
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
            <div className="flex-grow overflow-y-auto pb-28">{renderPage()}</div>
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
                <button key={name} onClick={() => setActivePage(name)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors w-24 ${activePage === name ? '' : 'opacity-60'}`}>
                    <div style={{color: activePage === name ? colors.accent : colors.text}}>{icon}</div>
                    <span className="text-xs font-semibold" style={{color: activePage === name ? colors.accent : colors.text}}>{name}</span>
                </button>
            ))}
        </nav>
    );
};

// --- ACCOUNT PAGE (UNCHANGED) ---
const AccountPage=()=> { const {colors,user,setUser,theme,toggleTheme}=useAppContext(); return <div className="p-6"><h1 className="text-4xl font-bold mb-8">Account</h1><div className="p-6 rounded-2xl shadow-xl space-y-6" style={{backgroundColor:colors.card}}><div className="flex items-center gap-4"><UserCircle size={48} style={{color:colors.accent}}/><div><p className='text-2xl font-bold capitalize'>{user}</p><p className='opacity-60'>View Profile</p></div></div><div className='flex justify-between items-center'><p className="font-semibold">Theme</p><button onClick={toggleTheme} className="p-3 rounded-full flex items-center gap-2 font-semibold" style={{backgroundColor:colors.input,color:colors.text}}>{theme==='light'?<><Moon size={20}/> Light</>:<><Sun size={20}/> Dark</>}</button></div><button onClick={()=>setUser(null)} className="w-full py-3 font-bold text-red-500 rounded-lg" style={{backgroundColor:colors.input}}>Log Out</button></div></div>; };


// --- STUDENT DASHBOARD (UNCHANGED) ---
const StudentDashboard = () => {
    const { subjects } = useAppContext();
    const [greeting, setGreeting] = useState('');
    useEffect(() => { const hour=new Date().getHours(); if(hour<12)setGreeting('Good morning'); else if(hour<18)setGreeting('Good afternoon'); else setGreeting('Good evening'); }, []);
    return (
        <div className='p-6'>
            <h1 className="text-4xl font-extrabold mb-8" suppressHydrationWarning>{greeting}</h1>
            <h2 className="text-2xl font-bold mb-4">Continue Studying</h2><ContinueStudyingCard />
            <h2 className="text-2xl font-bold mt-8 mb-4">All Subjects</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">{Object.entries(subjects).map(([name, data]) => (<SubjectCard key={name} name={name} data={data as Subject} />))}</div>
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
            <div className="relative w-24 h-24 flex items-center justify-center rounded-full" style={{background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`, color: 'white', boxShadow: `0 6px 20px ${colors.shadow}`}}><DynamicIcon name={subjectData.iconName} size={48} /></div>
            <div className="flex-grow"><p className='text-sm opacity-80 mb-1'>UP NEXT</p><h3 className="text-xl font-bold">{subjectName}</h3><p className='text-sm opacity-60'>Module 2: Quality Control</p></div>
             <button className="w-16 h-16 rounded-full flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110" style={{backgroundColor: colors.accent, color: 'white'}}><Play size={32}/></button>
        </div>
    )
}
const SubjectCard = ({ name, data }: { name: string; data: Subject }) => {
    const { colors } = useAppContext();
    return (
        <div className="group rounded-2xl shadow-lg overflow-hidden relative p-4 flex flex-col justify-between transition-all hover:scale-105 hover:shadow-2xl" style={{ background: colors.card, minHeight: '220px' }}>
            <div className="flex-grow flex items-center justify-center"><div className="w-24 h-24 rounded-full flex items-center justify-center" style={{ background: `linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`, color: 'white', boxShadow: `0 6px 20px ${colors.shadow}` }}><DynamicIcon name={data.iconName} size={48} /></div></div>
            <h3 className="text-md font-bold mt-4 text-center">{name}</h3>
            <button className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-y-0 translate-y-4 absolute bottom-4 right-4 w-12 h-12 rounded-full flex items-center justify-center shadow-2xl" style={{backgroundColor: colors.accent, color: 'white'}}><Play /></button>
        </div>
    );
};


// --- STUDENT MODULES & ASSESSMENTS ---
const StudentModules=()=> { const {colors,subjects,userProgress}=useAppContext(); const [openSubject,setOpenSubject]=useState<string|null>('Clinical Chemistry'); const getModuleCompletion=(subjectName:string,moduleTitle:string)=> { return userProgress[subjectName]?.modules?.[moduleTitle]||false; }; return <div className='p-6'><h1 className="text-4xl font-extrabold mb-8">My Courses</h1><div className="space-y-4">{Object.entries(subjects).map(([name,data])=>(<div key={name} className="rounded-2xl overflow-hidden shadow-lg" style={{backgroundColor:colors.card}}><button onClick={()=>setOpenSubject(openSubject===name?null:name)} className="w-full flex justify-between items-center p-4"><div className="flex items-center gap-4"><div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{background:`linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,color:'white'}}><DynamicIcon name={(data as Subject).iconName} size={20}/></div><span className="font-bold text-lg">{name}</span></div><ChevronDown className={`transition-transform ${openSubject===name?'':'-rotate-90'}`}/></button>{openSubject===name&&(<div className="p-4 border-t" style={{borderColor:colors.border}}>{(data as Subject).modules.length>0?(data as Subject).modules.map((mod: Module)=><ModuleItem key={mod.title} module={{...mod,completed:getModuleCompletion(name,mod.title)}} subjectName={name}/>):<p className="text-center opacity-60 py-4">Modules coming soon!</p>}</div>)}</div>))}</div></div>; };
const ModuleItem=({module,subjectName}:{module:Module;subjectName:string})=> { const {colors,user,setUserProgress}=useAppContext(); const toggleModuleCompletion=async ()=> { if(!user)return; const newCompleted=!module.completed; setUserProgress((prev:any)=> { const newProg=JSON.parse(JSON.stringify(prev)); if(!newProg[subjectName])newProg[subjectName]={modules:{}}; newProg[subjectName].modules[module.title]=newCompleted; return newProg; }); await updateModuleCompletion(user,subjectName,module.title,newCompleted); }; return <div className={`p-4 rounded-lg mb-2 flex items-center justify-between transition-opacity ${!module.unlocked&&'opacity-50'}`}><div className="flex items-center gap-4"><button onClick={toggleModuleCompletion} disabled={!module.unlocked} className="cursor-pointer">{module.completed?<CheckCircle className="text-green-500"/>:<div className="w-6 h-6 rounded-full border-2" style={{borderColor:colors.border}}></div>}</button><div><p className="font-semibold">{module.title}</p><div className="flex flex-col gap-2 text-sm opacity-60 mt-2">{module.content.map(file=>(<a href={file.url} target="_blank" rel="noopener noreferrer" key={file.name} className="flex items-center gap-2 hover:opacity-80">{file.type==='pdf'?<FileText size={14}/>:<Video size={14}/>}{file.name}</a>))}</div></div></div>{module.unlocked?<button className="p-2 rounded-full hover:opacity-80" style={{backgroundColor:colors.input}}><Search size={20}/></button>:<Lock/>}</div>; };
const AssessmentHub=()=> { const {colors,subjects,userProgress}=useAppContext(); const [quizState,setQuizState]=useState({inQuiz:false,questions:[] as Question[],title:''}); const allSubjectsCompleted=useMemo(()=> { return Object.keys(subjects).every(subjectName=> { const subject=subjects[subjectName]; const progress=userProgress[subjectName]; if(!progress||!progress.modules)return false; return subject.modules.every((module: Module)=>progress.modules[module.title]); }); },[subjects,userProgress]); if(quizState.inQuiz)return <QuizEngine questions={quizState.questions} title={quizState.title} onFinish={()=>setQuizState({inQuiz:false,questions:[],title:''})}/>; const startPracticeTest=async (subjectName:string)=> { const questions=await getSubjectQuestions(subjectName); if(questions.length>0) { setQuizState({inQuiz:true,questions,title:`${subjectName} Practice Exam`}); } }; const startFinalExam=async ()=> { const questions=await getSubjectQuestions('Clinical Chemistry'); setQuizState({inQuiz:true,questions,title:'Final Mock Exam'}); }; return <div className='p-6'><h1 className="text-4xl font-extrabold mb-8">Assessments</h1><button onClick={startFinalExam} disabled={!allSubjectsCompleted} className="w-full p-8 text-left text-2xl font-bold text-white rounded-2xl transition-all hover:scale-102 shadow-2xl mb-12 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100" style={{background:allSubjectsCompleted?`linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`:colors.card,color:allSubjectsCompleted?'white':colors.text}}><div className="flex justify-between items-center"><div>Final Mock Exam<p className="text-sm font-normal opacity-80 mt-2">{allSubjectsCompleted?'You are ready for the final challenge!':'Complete all subject assessments to unlock.'}</p></div>{!allSubjectsCompleted&&<Lock size={40}/>}</div></button><h2 className="text-2xl font-bold mb-4">Practice Assessments</h2><div className="space-y-4">{Object.entries(subjects).map(([name,data])=>(<AssessmentItem key={name} name={name} data={data as Subject} onStart={()=>startPracticeTest(name)} userProgress={userProgress[name]}/>))}</div></div>; };
const AssessmentItem=({name,data,onStart,userProgress}:{name:string;data:Subject;onStart:()=>void;userProgress:any})=> { const {colors}=useAppContext(); const modulesCompleted=useMemo(()=> { if(!userProgress||!userProgress.modules)return false; return data.modules.every(module=>userProgress.modules[module.title]); },[data.modules,userProgress]); const isLocked=!modulesCompleted; return <button onClick={onStart} disabled={isLocked} className="w-full p-4 rounded-2xl shadow-lg flex items-center gap-4 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-102" style={{background:colors.cardGradient,boxShadow:`0 8px 32px ${colors.shadow}`}}><div className="relative w-16 h-16 flex items-center justify-center rounded-full flex-shrink-0" style={{background:`linear-gradient(135deg, ${colors.accent}, ${colors.accent2})`,color:'white'}}><DynamicIcon name={data.iconName} size={32}/></div><div className="flex-grow text-left"><h3 className="text-lg font-bold">{name}</h3><p className="text-sm opacity-60">{isLocked?'Complete all modules to unlock':'Practice Exam'}</p></div>{isLocked?<Lock size={32} className="opacity-50"/>:<div className="w-12 h-12 rounded-full flex items-center justify-center" style={{backgroundColor:colors.accent,color:'white'}}><Play/></div>}</button>; };


// --- QUIZ ENGINE & REVIEW MODE (UNCHANGED) ---
const QuizEngine=({questions,title,onFinish}:{questions:Question[];title:string;onFinish:()=>void})=> { const {colors,toggleFullScreen,isFullScreen}=useAppContext(); const [current,setCurrent]=useState(0); const [answers,setAnswers]=useState<(string|null)[]>(()=>Array(questions.length).fill(null)); const [selectedOption,setSelectedOption]=useState<string|null>(null); const [bookmarks,setBookmarks]=useState<boolean[]>(()=>Array(questions.length).fill(false)); const [timeLeft,setTimeLeft]=useState(questions.length*72); const [showResult,setShowResult]=useState(false); const [showConfetti,setShowConfetti]=useState(false); const [reviewMode,setReviewMode]=useState(false); const [showExitConfirm,setShowExitConfirm]=useState(false); const [isPanelVisible,setIsPanelVisible]=useState(true); useEffect(()=> { if(!isFullScreen)toggleFullScreen(); const timer=setInterval(()=>setTimeLeft(t=>t>0?t-1:0),1000); return ()=> { clearInterval(timer); if(document.fullscreenElement)toggleFullScreen(); }; },[]); const handleAnswer=()=> { if(selectedOption===null)return; const newAns=[...answers]; newAns[current]=selectedOption; setAnswers(newAns); setSelectedOption(null); if(current<questions.length-1) { setCurrent(current+1); } else { setShowResult(true); checkScore(newAns); } }; const toggleBookmark=()=> { const newBookmarks=[...bookmarks]; newBookmarks[current]=!newBookmarks[current]; setBookmarks(newBookmarks); }; const checkScore=(finalAnswers:(string|null)[])=> { const score=finalAnswers.reduce((acc,ans,i)=>acc+(ans===questions[i].answer?1:0),0); if(Math.round(score/questions.length*100)>=75) { setShowConfetti(true); setTimeout(()=>setShowConfetti(false),8000); } }; if(questions.length===0) { return <div className="flex items-center justify-center h-full">Loading questions...</div>; } if(showResult) { const score=answers.reduce((acc,ans,i)=>acc+(ans===questions[i].answer?1:0),0); const percentage=Math.round(score/questions.length*100); if(reviewMode) { return <ReviewMode questions={questions} answers={answers} onExit={()=>setReviewMode(false)}/>; } return <div className="p-8 text-center flex flex-col items-center justify-center h-full">{showConfetti&&<Confetti width={window.innerWidth} height={window.innerHeight} colors={[colors.accent,colors.accent2,'#FFFFFF']}/>}<div className={`p-8 rounded-2xl shadow-2xl w-full max-w-md`} style={{backgroundColor:colors.card}}><h2 className={`text-4xl font-bold ${percentage>=75?'text-green-400':'text-red-400'}`}>{percentage>=75?'Congratulations!':'Review Needed'}</h2><p className="text-7xl font-bold my-6" style={{color:colors.accent}}>{percentage}%</p><p className="text-xl mb-8">You got {score} out of {questions.length} questions correct.</p><div className="flex gap-4 justify-center"><button onClick={()=>setReviewMode(true)} className="py-3 px-6 text-white rounded-lg font-semibold" style={{backgroundColor:colors.accent}}>Review Answers</button><button onClick={onFinish} className="py-3 px-6 rounded-lg font-semibold" style={{backgroundColor:colors.input}}>Back to Hub</button></div></div></div>; } return <div className={`flex flex-col md:flex-row absolute inset-0 z-10`} style={{background:colors.gradient}}>{showExitConfirm&&<div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center z-20"><div className="p-8 rounded-2xl shadow-lg w-full max-w-sm" style={{backgroundColor:colors.card}}><AlertTriangle className="text-red-500 mx-auto mb-4" size={48}/><h2 className="text-2xl font-bold text-center mb-4">Exit Assessment?</h2><p className="text-center opacity-70 mb-8">Your progress will be saved, but the timer will continue to run. Are you sure you want to exit?</p><div className="flex justify-around"><button onClick={()=>setShowExitConfirm(false)} className="py-3 px-8 rounded-lg font-semibold" style={{backgroundColor:colors.input}}>Cancel</button><button onClick={onFinish} className="py-3 px-8 bg-red-600 text-white rounded-lg font-semibold">Exit</button></div></div></div>}{isPanelVisible&&<div className="w-full md:w-80 p-4 border-b md:border-r overflow-y-auto transition-all duration-300" style={{borderColor:colors.border}}><div className={`flex items-center justify-center gap-2 p-3 font-bold rounded-lg mb-4 text-white text-lg ${timeLeft<300?'bg-red-500 animate-pulse':''}`} style={{backgroundColor:timeLeft>=300?colors.accent2:''}}><Timer/><span>{`${Math.floor(timeLeft/60)}:${('0'+timeLeft%60).slice(-2)}`}</span></div><h2 className="text-xl font-bold mb-4 px-2">{title}</h2><div className="grid grid-cols-5 gap-2">{Array.from({length:questions.length}).map((_,i)=><button key={i} onClick={()=>setCurrent(i)} className={`relative w-full h-12 text-md font-semibold rounded-lg ring-2 ${answers[i]!==null?'opacity-70':''}`} style={{backgroundColor:answers[i]!==null?'#2ECC71':colors.input,['--tw-ring-color' as any]:colors.accent}}>{i+1}{bookmarks[i]&&<Bookmark size={12} className="absolute top-1 right-1" style={{color:colors.accent}} fill={colors.accent}/>}</button>)}</div></div>}<div className="flex-1 p-6 md:p-10 flex flex-col"><div className="flex justify-between items-start mb-4"><div className="flex items-center gap-2"><button onClick={()=>setIsPanelVisible(!isPanelVisible)} className={`p-2 rounded-full hover:opacity-80`} style={{backgroundColor:colors.input}}>{isPanelVisible?<PanelLeftClose/>:<PanelRightClose/>}</button><p className="opacity-60">Question {current+1} of {questions.length}</p></div><div className="flex items-center gap-2"><button onClick={()=>setShowExitConfirm(true)} className={`p-2 rounded-full hover:opacity-80`} style={{backgroundColor:colors.input}}><XCircle className="text-red-500"/></button><button onClick={toggleBookmark} className={`p-2 rounded-full hover:opacity-80 ${bookmarks[current]?'':'opacity-60'}`} style={{backgroundColor:colors.input}}><Bookmark style={{color:bookmarks[current]?colors.accent:colors.text,fill:bookmarks[current]?colors.accent:'transparent'}}/></button><button className="p-2 rounded-full hover:opacity-80 opacity-60" style={{backgroundColor:colors.input}} onClick={toggleFullScreen}><Maximize/></button></div></div><h2 className="text-3xl font-semibold mb-8 flex-grow">{questions[current].question}</h2><div className="grid grid-cols-1 md:grid-cols-2 gap-4">{questions[current].options.map(opt=><button key={opt} onClick={()=>setSelectedOption(opt)} className={`p-5 text-left rounded-xl text-lg transition-colors border-2 ${selectedOption===opt?'border-sky-500':''}`} style={{backgroundColor:colors.card,borderColor:selectedOption===opt?colors.accent:colors.border}}>{opt}</button>)}</div><div className="mt-8 text-right"><button onClick={handleAnswer} disabled={selectedOption===null} className="py-3 px-8 rounded-lg font-semibold text-white disabled:opacity-50" style={{backgroundColor:colors.accent}}>Submit</button></div></div></div>; };
const ReviewMode=({questions,answers,onExit}:{questions:Question[];answers:(string|null)[];onExit:()=>void})=> { const {colors}=useAppContext(); return <div className="p-4 md:p-8"><div className="flex justify-between items-center mb-8"><h1 className="text-4xl font-bold">Review</h1><button onClick={onExit} className="py-2 px-4 rounded-lg font-semibold" style={{backgroundColor:colors.input}}>Exit Review</button></div><div className="space-y-6">{questions.map((q,i)=> { const userAnswer=answers[i]; const isCorrect=userAnswer===q.answer; return <div key={q.id} className="p-4 rounded-lg shadow-md" style={{backgroundColor:colors.card,borderLeft:`4px solid ${isCorrect?'#2ECC71':'#E74C3C'}`}}><p className="font-bold mb-2 text-lg">{i+1}. {q.question}</p><p className={`${isCorrect?'text-green-400':'text-red-400'}`}>Your answer: <span className="font-semibold">{userAnswer||'Not Answered'}</span></p>{!isCorrect&&<p className="text-green-400">Correct Answer: <span className="font-semibold">{q.answer}</span></p>}<p className="text-sm opacity-60 mt-2">{q.rationale}</p></div>; })}</div></div>; };


// --- ADMIN / CONTENT MANAGER ---
const ContentManager = () => {
    const { colors, subjects, forceReloadSubjects } = useAppContext();
    const [selectedSubject, setSelectedSubject] = useState(Object.keys(subjects)[0] || '');
    const [selectedModule, setSelectedModule] = useState(subjects[Object.keys(subjects)[0]]?.modules[0]?.title || '');
    const [questionJson, setQuestionJson] = useState('');
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [file, setFile] = useState<globalThis.File | null>(null);
    const [statusMessage, setStatusMessage] = useState<{type: 'success' | 'error', msg: string} | null>(null);

    const onDrop = useCallback((acceptedFiles: globalThis.File[]) => {
      if (acceptedFiles[0]) {
        setFile(acceptedFiles[0]);
        setStatusMessage(null); // Clear status on new file selection
      }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({onDrop, accept: {'application/pdf': ['.pdf'], 'video/mp4': ['.mp4']}});

    useEffect(() => {
        if (!selectedSubject && Object.keys(subjects).length > 0) {
            setSelectedSubject(Object.keys(subjects)[0]);
        }
    }, [subjects, selectedSubject]);

    useEffect(() => {
        const subject = subjects[selectedSubject];
        if (subject && (!selectedModule || !subject.modules.find((m: Module) => m.title === selectedModule))) {
          setSelectedModule(subject.modules[0]?.title || '');
        }
    }, [selectedSubject, subjects, selectedModule]);

    useEffect(() => {
        if (selectedSubject) {
            getSubjectQuestions(selectedSubject).then(questions => {
                setQuestionJson(JSON.stringify(questions, null, 2));
            });
        }
    }, [selectedSubject]);

    const handleQuestionUpdate = async () => {
        setStatusMessage({type: 'success', msg: 'Updating questions...'});
        const result = await updateSubjectQuestions(selectedSubject, questionJson);
        if (result.success) {
            setStatusMessage({type: 'success', msg: 'Question bank updated successfully!'});
        } else {
            setStatusMessage({type: 'error', msg: `Error: ${result.error}`});
        }
        setTimeout(() => setStatusMessage(null), 3000);
    }

    const handleFileUpload = async () => {
        if (!file || !selectedModule) return;
        setUploading(true);
        setProgress(0);
        setStatusMessage(null);
    
        const interval = setInterval(() => {
            setProgress(p => (p >= 95 ? p : p + 5));
        }, 250);
    
        const formData = new FormData();
        formData.append('file', file);
    
        try {
            const result = await handleLocalUploadAndUpdate(formData, selectedSubject, selectedModule);
            clearInterval(interval);
            setProgress(100);
    
            if (result.success) {
                setStatusMessage({type: 'success', msg: 'File uploaded and linked successfully!'});
                forceReloadSubjects();
            } else {
                setStatusMessage({type: 'error', msg: `Upload failed: ${result.error || 'Unknown server error.'}`});
            }
        } catch (error) {
            clearInterval(interval);
            console.error("Upload error:", error);
            setStatusMessage({type: 'error', msg: `Upload failed: ${error instanceof Error ? error.message : 'Check server logs for details.'}`});
        }
    
        setTimeout(() => {
            setUploading(false);
            setFile(null);
            setProgress(0);
            // Keep the status message visible for a bit longer for errors
            setTimeout(() => setStatusMessage(null), 2000);
        }, 3000);
    };

    if (!selectedSubject) return <div className='p-6'><h1 className="text-4xl font-extrabold mb-8">Content Manager</h1><p>Loading subjects...</p></div>;

    return (
        <div className='p-6'>
             <h1 className="text-4xl font-extrabold mb-8">Content Manager</h1>
             {statusMessage && <div className={`p-4 mb-4 rounded-lg text-white ${statusMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>{statusMessage.msg}</div>}
             <div className="grid lg:grid-cols-2 gap-8 mb-8">
                 <div>
                    <label htmlFor="subject-select" className="block text-lg font-semibold mb-2">Select Subject</label>
                    <select id="subject-select" value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)} className="w-full p-4 rounded-xl border" style={{borderColor: colors.border, backgroundColor: colors.input, '--tw-ring-color': colors.accent} as React.CSSProperties}>
                        {Object.keys(subjects).map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="module-select" className="block text-lg font-semibold mb-2">Select Module</label>
                    <select id="module-select" value={selectedModule} onChange={e => setSelectedModule(e.target.value)} disabled={!subjects[selectedSubject]?.modules.length} className="w-full p-4 rounded-xl border disabled:opacity-50" style={{borderColor: colors.border, backgroundColor: colors.input, '--tw-ring-color': colors.accent} as React.CSSProperties}>
                        {subjects[selectedSubject]?.modules.map((mod: Module) => <option key={mod.title} value={mod.title}>{mod.title}</option>)}
                    </select>
                </div>
             </div>

             <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-6 rounded-2xl space-y-4 shadow-lg" style={{ backgroundColor: colors.card}}>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Upload/> Upload Course Materials</h2>
                    <p className="opacity-60 text-sm">Upload PDFs and videos to <span className="font-bold">{selectedModule}</span> in <span className="font-bold">{selectedSubject}</span>.</p>
                    <div {...getRootProps()} className={`p-12 border-2 border-dashed rounded-xl text-center cursor-pointer transition-colors ${isDragActive ? 'border-sky-500' : ''}`} style={{borderColor: colors.border}}>
                        <input {...getInputProps()} />
                        <Upload className="mx-auto opacity-40 mb-2" size={48}/>
                        { isDragActive ? <p>Drop the files here ...</p> : <p>Drag 'n' drop files here, or click to select</p>}
                        <p className="text-sm opacity-60">PDFs or Videos</p>
                    </div>
                    {file && (
                      <div className="mt-4">
                        <p>Selected file: {file.name}</p>
                        <button onClick={handleFileUpload} disabled={uploading || !selectedModule} className="w-full relative overflow-hidden py-3 mt-2 font-bold text-white rounded-lg disabled:opacity-50" style={{backgroundColor: colors.accent}}>
                            <div className='absolute top-0 left-0 h-full bg-sky-400/50' style={{width: `${progress}%`}}></div>
                            <span className='relative z-10'>{uploading ? `Uploading... ${progress}%` : 'Upload File'}</span>
                        </button>
                      </div>
                    )}
                </div>
                 <div className="p-6 rounded-2xl space-y-4 shadow-lg" style={{ backgroundColor: colors.card}}>
                    <h2 className="text-xl font-semibold flex items-center gap-2"><Edit/> Question Lab</h2>
                    <p className="opacity-60 text-sm">Edit the JSON for the <span className="font-bold">{selectedSubject}</span> practice exam.</p>
                     <textarea className="w-full h-60 p-3 bg-transparent border-2 rounded-lg font-mono text-sm" placeholder={`Paste JSON array of questions for ${selectedSubject}...`} value={questionJson} onChange={(e) => setQuestionJson(e.target.value)} style={{borderColor: colors.border}}/>
                     <button onClick={handleQuestionUpdate} className="w-full py-3 font-bold text-white rounded-lg" style={{backgroundColor: colors.accent}}>Update {selectedSubject} Questions</button>
                </div>
             </div>
        </div>
    )
}
