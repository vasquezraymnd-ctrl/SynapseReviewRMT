
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
  const [isSeeding, setIsSeeding] = useState(true);

  const fetchSubjects = async () => {
    try {
      const fetchedSubjects = await getSubjects();
      if (!fetchedSubjects || Object.keys(fetchedSubjects).length === 0) {
        throw new Error('No subjects returned from the server.');
      }
      setSubjects(fetchedSubjects);
      const initialEditingState: { [key: string]: string } = {};
      for (const subjectName of Object.keys(fetchedSubjects)) {
        const questions = await getSubjectQuestions(subjectName);
        initialEditingState[subjectName] = JSON.stringify(questions, null, 2);
      }
      setEditingQuestions(initialEditingState);
    } catch (err) {
      console.error(err);
      setError('Failed to load data from the server. Please ensure your Firebase Admin SDK credentials are correctly set in the environment variables and restart the development server.');
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await seedInitialData();
        await fetchSubjects();
      } catch (err) {
        console.error(err);
        setError('Failed to initialize the application. Please check the console for more details.');
      }
      setIsSeeding(false);
    };
    initializeApp();
  }, []);

  const onDrop = async (acceptedFiles: File[], subjectName: string, moduleTitle: string) => {
    const formData = new FormData();
    formData.append('file', acceptedFiles[0]);

    try {
      const result = await handleLocalUploadAndUpdate(formData, subjectName, moduleTitle);
      if (result.success) {
        console.log('File uploaded and database updated!');
        fetchSubjects(); // Refresh data
      } else {
        throw new Error(result.error || 'Upload failed');
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
        throw new Error(result.error || 'Failed to save questions');
      }
      console.log('Questions updated successfully!');
      fetchSubjects(); // Refresh data
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isSeeding) {
    return <p className="text-white">Seeding initial data, please wait...</p>
  }

  if (error) {
    return (
        <div className="bg-red-800 p-8 rounded-lg shadow-lg text-center">
            <h1 className="text-2xl font-bold mb-4">Server Connection Error</h1>
            <p className="text-white">{error}</p>
        </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      {subjects ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(subjects).map(([name, subject]) => (
            <div key={name} className="bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-semibold mb-4 text-white">{name}</h2>
              {subject.modules.map((module: Module) => (
                <ModuleUploader key={module.title} subjectName={name} module={module} onDrop={onDrop} />
              ))}
              <div className="mt-4">
                <h3 className="text-xl font-semibold mb-2 text-white">Edit Questions (JSON)</h3>
                <textarea
                  className="w-full h-64 p-2 border rounded bg-gray-700 text-white"
                  value={editingQuestions[name] || ''}
                  onChange={(e) => handleQuestionChange(name, e.target.value)}
                ></textarea>
                <button 
                  className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={() => handleQuestionSave(name)}
                >
                  Save Questions
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-white">Loading subjects...</p>
      )}
    </div>
  );
}

function ModuleUploader({ subjectName, module, onDrop }: { subjectName: string, module: Module, onDrop: (files: File[], subjectName: string, moduleTitle: string) => void }) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop: (files) => onDrop(files, subjectName, module.title) });

  return (
    <div {...getRootProps()} className={`mt-4 p-4 border-2 border-dashed rounded-md ${isDragActive ? 'border-blue-500' : 'border-gray-600'}`}>
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center">
        <Upload className="w-10 h-10 text-gray-400" />
        <p className="mt-2 text-gray-400">Drop files here or click to upload for {module.title}</p>
        {module.content && module.content.map((file: DbFile) => (
          <p key={file.url} className="text-sm text-green-400">Uploaded: {file.name}</p>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
    const isAdmin = true; // Assuming admin for now

    return (
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gray-900 text-white">
            {isAdmin ? <AdminDashboard /> : <p>You do not have access to the admin dashboard.</p>}
        </main>
      </Suspense>
    );
}
