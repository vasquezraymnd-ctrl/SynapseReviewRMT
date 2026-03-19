
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { getSubjects, getSubjectQuestions, handleLocalUploadAndUpdate, updateSubjectQuestions, seedInitialData } from './actions';
import { Subjects, Module, File as DbFile } from './types';
import { Beaker, BookImage, Bug, HeartPulse, Pipette, ShieldCheck, Upload } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

const ICONS: { [key: string]: React.ElementType } = {
  Beaker,
  HeartPulse,
  Bug,
  ShieldCheck,
  Pipette,
  BookImage
};

function AdminDashboard() {
  const [subjects, setSubjects] = useState<Subjects | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editingQuestions, setEditingQuestions] = useState<{ [key: string]: string }>({});
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        const fetchedSubjects = await getSubjects();
        if (!fetchedSubjects || Object.keys(fetchedSubjects).length === 0) {
          const seedResult = await seedInitialData();
          if (!seedResult.success) {
            throw new Error(seedResult.error || 'Failed to seed initial data.');
          }
          // Re-fetch subjects after seeding
          const refetchedSubjects = await getSubjects();
          if (!refetchedSubjects || Object.keys(refetchedSubjects).length === 0) {
            throw new Error('Database connection was successful, but no subjects were found even after seeding.');
          }
          setSubjects(refetchedSubjects);
        } else {
          setSubjects(fetchedSubjects);
        }

      } catch (err: any) {
        console.error("Initialization Error:", err);
        setError(err.message);
      } finally {
        setIsInitializing(false);
      }
    };
    initializeApp();
  }, []);

  useEffect(() => {
    const setQuestions = async () => {
        if(subjects){
            const initialEditingState: { [key: string]: string } = {};
            for (const subjectName of Object.keys(subjects)) {
            const questions = await getSubjectQuestions(subjectName);
            initialEditingState[subjectName] = JSON.stringify(questions, null, 2);
            }
            setEditingQuestions(initialEditingState);
        }
    }
    setQuestions();
  }, [subjects]);

  const onDrop = async (acceptedFiles: File[], subjectName: string, moduleTitle: string) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);
    try {
      const result = await handleLocalUploadAndUpdate(formData, subjectName, moduleTitle);
      if (result.success) {
        console.log('File uploaded successfully!');
        // Refresh subjects to show new file
        const refreshedSubjects = await getSubjects();
        setSubjects(refreshedSubjects);
      } else {
        throw new Error(result.error || 'Upload failed unexpectedly.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleQuestionChange = (subjectName: string, value: string) => {
    setEditingQuestions(prev => ({ ...prev, [subjectName]: value }));
  };

  const handleQuestionSave = async (subjectName: string) => {
    try {
      const result = await updateSubjectQuestions(subjectName, editingQuestions[subjectName]);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save questions.');
      }
      console.log('Questions updated successfully!');
      // Optionally, re-fetch to confirm save, though not strictly necessary
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isInitializing) {
    return <p className="text-white animate-pulse">Connecting to the server and initializing data...</p>;
  }

  if (error) {
    return (
        <div className="bg-red-800 p-8 rounded-lg shadow-2xl text-center max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-4">Server Connection Error</h1>
            <p className="text-white text-lg whitespace-pre-wrap font-mono bg-red-900 p-4 rounded-md">{error}</p>
        </div>
    );
  }

  return (
    <div className="p-8 w-full max-w-7xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Teacher's Lounge (Admin)</h1>
      {subjects ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {Object.entries(subjects).map(([name, subject]) => (
            <div key={name} className="bg-gray-800 shadow-xl rounded-lg p-6">
              <h2 className="text-3xl font-semibold mb-6 text-white flex items-center">
                {React.createElement(ICONS[subject.iconName] || Beaker, { className: 'mr-3' })} {name}
              </h2>
              {subject.modules.map((module: Module) => (
                <ModuleUploader key={module.title} subjectName={name} module={module} onDrop={onDrop} />
              ))}
              <div className="mt-6">
                <h3 className="text-2xl font-semibold mb-3 text-white">Edit Questions (JSON)</h3>
                <textarea
                  className="w-full h-72 p-3 border-2 border-gray-600 rounded bg-gray-900 text-white font-mono text-sm focus:border-blue-500 focus:ring-blue-500 transition-colors"
                  value={editingQuestions[name] || ''}
                  onChange={(e) => handleQuestionChange(name, e.target.value)}
                ></textarea>
                <button 
                  className="mt-4 w-full px-4 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-transform transform hover:scale-105 shadow-lg"
                  onClick={() => handleQuestionSave(name)}
                >
                  Save Questions for {name}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white text-center">Loading subjects...</p>
      )}
    </div>
  );
}

function ModuleUploader({ subjectName, module, onDrop }: { subjectName: string, module: Module, onDrop: (files: File[], subjectName: string, moduleTitle: string) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: (files) => onDrop(files, subjectName, module.title) });

  return (
    <div {...getRootProps()} className={`mt-4 p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${isDragActive ? 'border-blue-500 bg-gray-700' : 'border-gray-600 hover:border-gray-500'}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <Upload className="w-12 h-12 text-gray-400 mb-2" />
        <p className="text-lg text-gray-300">Drop files or click to upload for:</p>
        <p className="font-semibold text-xl text-white">{module.title}</p>
        {module.content && module.content.map((file: DbFile) => (
          <p key={file.url} className="mt-2 text-sm text-green-400">✓ Uploaded: {file.name}</p>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
    return (
        <Suspense fallback={<div className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white text-2xl">Loading Application...</div>}>
            <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 md:p-24 bg-gray-900 text-white">
                <AdminDashboard />
            </main>
        </Suspense>
    );
}
