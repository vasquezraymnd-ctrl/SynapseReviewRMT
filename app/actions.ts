
'use server';

import { db, storage } from '../lib/firebase';
import { Question, Subjects, Module, File as DbFile, Subject } from './types';
import { z } from 'zod';
import { Readable } from 'stream';

const QuestionSchema = z.array(z.object({
    id: z.number(),
    question: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
    rationale: z.string(),
}));

export async function getSubjects(): Promise<Subjects> {
    const subjectsSnapshot = await db.collection('subjects').get();
    const subjects: Subjects = {};
    subjectsSnapshot.forEach(doc => {
        subjects[doc.id] = doc.data() as Subject;
    });
    return subjects;
}

export async function getSubjectQuestions(subjectName: string): Promise<Question[]> {
    const doc = await db.collection('subjects').doc(subjectName).get();
    if (!doc.exists) {
        return [];
    }
    const data = doc.data();
    return data?.questions || [];
}

export async function handleLocalUploadAndUpdate(formData: FormData, subjectName: string, moduleTitle: string): Promise<{ success: boolean, error?: string, fileUrl?: string }> {
    try {
        const file = formData.get('file') as globalThis.File | null;

        if (!file) {
            return { success: false, error: 'No file provided.' };
        }

        const bucket = storage.bucket();
        const filePath = `uploads/${subjectName}/${moduleTitle}/${file.name}`;
        const fileBuffer = Buffer.from(await file.arrayBuffer());

        const blob = bucket.file(filePath);
        const blobStream = blob.createWriteStream({
            metadata: {
                contentType: file.type,
            },
        });

        await new Promise((resolve, reject) => {
            blobStream.on('error', reject);
            blobStream.on('finish', resolve);
            blobStream.end(fileBuffer);
        });

        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${filePath}`;

        const subjectRef = db.collection('subjects').doc(subjectName);
        const subjectDoc = await subjectRef.get();

        if (!subjectDoc.exists) {
            return { success: false, error: 'Subject not found' };
        }

        const subjectData = subjectDoc.data() as Subjects[string];
        const moduleIndex = subjectData.modules.findIndex(m => m.title === moduleTitle);

        if (moduleIndex === -1) {
            return { success: false, error: 'Module not found' };
        }

        const newFile: DbFile = {
            name: file.name,
            url: publicUrl,
            type: file.type.startsWith('video') ? 'video' : 'pdf',
        };

        if (!subjectData.modules[moduleIndex].content) {
            subjectData.modules[moduleIndex].content = [];
        }

        subjectData.modules[moduleIndex].content.push(newFile);

        await subjectRef.update({
            modules: subjectData.modules
        });

        return { success: true, fileUrl: publicUrl };

    } catch (error: any) {
        console.error('Error uploading to Firebase:', error);
        return { success: false, error: `Upload failed: ${error.message}` };
    }
}

export async function updateSubjectQuestions(subjectName: string, questionsJson: string): Promise<{ success: boolean, error?: string }> {
    try {
        const questions = QuestionSchema.parse(JSON.parse(questionsJson));
        await db.collection('subjects').doc(subjectName).update({ questions });
        return { success: true };
    } catch (error) {
        if (error instanceof z.ZodError || error instanceof SyntaxError) {
            return { success: false, error: 'Invalid JSON format.' };
        }
        console.error('Error updating questions:', error);
        return { success: false, error: 'Failed to update questions.' };
    }
}

export async function getUserProgress(userId: string) {
    // Implement actual user progress fetching if needed
    return {}; 
}

export async function updateModuleCompletion(userId: string, subjectName: string, moduleTitle: string, completed: boolean) {
    // Implement actual user progress update if needed
    return { success: true };
}

export async function seedInitialData(): Promise<{ success: boolean, message?: string, error?: string }> {
    try {
        const subjectsRef = db.collection('subjects');
        const snapshot = await subjectsRef.get();

        if (!snapshot.empty) {
            console.log('Database already seeded.');
            return { success: true, message: 'Database already contains data.' };
        }

        console.log('Seeding initial data...');

        const initialSubjects: Subjects = {
             'Clinical Chemistry': {
                iconName: 'Beaker',
                modulesCompleted: true,
                questions: Array.from({ length: 100 }, (_, i) => ({
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
                })),
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

        const batch = db.batch();

        for (const [subjectName, subjectData] of Object.entries(initialSubjects)) {
            const docRef = subjectsRef.doc(subjectName);
            batch.set(docRef, subjectData);
        }

        await batch.commit();
        console.log('Database seeded successfully.');
        return { success: true, message: 'Database seeded successfully.' };

    } catch (error: any) {
        console.error('Error during data seeding or Firebase initialization:', error);
        return { success: false, error: `Failed to connect to Firebase. Please ensure environment variables are set correctly on Netlify. Details: ${error.message}` };
    }
}
