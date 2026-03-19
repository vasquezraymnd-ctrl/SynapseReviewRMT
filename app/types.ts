export type IconName = 'Beaker' | 'HeartPulse' | 'Bug' | 'ShieldCheck' | 'Pipette' | 'BookImage' | 'FlaskConical' | 'Droplets' | 'Microscope' | 'Shield' | 'TestTube' | 'Layers';

export type File = { name: string; url: string; type: 'pdf' | 'video' };

export type Question = {
    id: number;
    question: string;
    options: string[];
    answer: string;
    rationale: string;
};

export type Module = {
    title: string;
    unlocked: boolean;
    content: File[];
    completed: boolean;
};

export type Subject = {
    iconName: IconName;
    modulesCompleted: boolean;
    questions: Question[]; // This will be handled in a subcollection, so it can be optional here.
    modules: Module[];
};

export type Subjects = {
    [key: string]: Subject;
};
