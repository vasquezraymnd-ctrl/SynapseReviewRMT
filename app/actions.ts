'use server';

import admin from '../lib/firebase-admin';
import { Subjects, Subject, Module, Question } from './types'; // Assuming types are moved to a separate file

const db = admin.firestore();

// --- INITIAL DATA (to be seeded into Firestore) ---
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
            { title: 'Module 1: Intro to CC', unlocked: true, content: [], completed: true },
            { title: 'Module 2: Quality Control', unlocked: true, content: [], completed: true },
            { title: 'Module 3: Carbohydrates', unlocked: true, content: [], completed: true },
        ]
    },
    'Hematology': {
        iconName: 'HeartPulse',
        modulesCompleted: false,
        questions: [],
        modules: [
            { title: 'Module 1: Introduction to Hematology', unlocked: true, content: [], completed: false },
        ]
    },
    'Microbiology': {
        iconName: 'Bug',
        modulesCompleted: false,
        questions: [],
        modules: [
            { title: 'Module 1: Introduction to Microbiology', unlocked: true, content: [], completed: false },
        ]
    },
    'ISBB': {
        iconName: 'ShieldCheck',
        modulesCompleted: false,
        questions: [],
        modules: [
            { title: 'Module 1: Immunohematology and Blood Banking', unlocked: true, content: [], completed: false },
        ]
    },
    'Clinical Microscopy': {
        iconName: 'Pipette',
        modulesCompleted: false,
        questions: [],
        modules: [
            { title: 'Module 1: Routine Urinalysis', unlocked: true, content: [], completed: false },
        ]
    },
    'Histopathology': {
        iconName: 'BookImage',
        modulesCompleted: false,
        questions: [],
        modules: [
            { title: 'Module 1: Tissue Processing', unlocked: true, content: [], completed: false },
        ]
    },
};

// --- SERVER ACTIONS ---

export async function getSubjects() {
    const subjectsRef = db.collection('subjects');
    let snapshot = await subjectsRef.get();

    if (snapshot.empty) {
        console.log('No subjects found, seeding initial data...');
        const batch = db.batch();
        Object.entries(initialSubjects).forEach(([subjectName, subjectData]) => {
            const { questions, ...subjectDocData } = subjectData;
            const subjectRef = subjectsRef.doc(subjectName);
            batch.set(subjectRef, subjectDocData);

            if (questions && questions.length > 0) {
                const questionsRef = subjectRef.collection('questions');
                questions.forEach(q => {
                    const questionRef = questionsRef.doc(String(q.id));
                    batch.set(questionRef, q);
                });
            }
        });
        await batch.commit();
        console.log('Seeding complete.');
        snapshot = await subjectsRef.get(); // Re-fetch after seeding
    }

    const subjects: Subjects = {};
    snapshot.forEach(doc => {
        subjects[doc.id] = doc.data() as Subject;
    });

    return subjects;
}

export async function getSubjectQuestions(subjectName: string): Promise<Question[]> {
    const questionsRef = db.collection('subjects').doc(subjectName).collection('questions');
    const snapshot = await questionsRef.get();
    if(snapshot.empty) return [];
    return snapshot.docs.map(doc => doc.data() as Question);
}

export async function getUserProgress(userId: string) {
    const progressRef = db.collection('users').doc(userId).collection('progress');
    const snapshot = await progressRef.get();
    if (snapshot.empty) return {}; // Return empty object if no progress

    const progress: { [key: string]: any } = {};
    snapshot.forEach(doc => {
        progress[doc.id] = doc.data();
    });
    return progress;
}

export async function updateModuleCompletion(userId: string, subjectName: string, moduleTitle: string, completed: boolean) {
    const progressRef = db.collection('users').doc(userId).collection('progress').doc(subjectName);
    try {
        await db.runTransaction(async (transaction) => {
            const doc = await transaction.get(progressRef);
            if (!doc.exists) {
                const newProgress = { modules: { [moduleTitle]: completed } };
                transaction.set(progressRef, newProgress);
            } else {
                const existingProgress = doc.data()?.modules || {};
                const updatedProgress = { ...existingProgress, [moduleTitle]: completed };
                transaction.update(progressRef, { modules: updatedProgress });
            }
        });
        return { success: true };
    } catch (error) {
        console.error('Error updating module completion:', error);
        return { success: false, error: 'Failed to update progress.' };
    }
}
