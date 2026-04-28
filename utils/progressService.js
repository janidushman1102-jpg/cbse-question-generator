import { db } from '../config/firebaseConfig';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';

export const saveStudentProgress = async (userId, grade, subject, testData) => {
  try {
    const progressRef = doc(db, 'studentProgress', userId);
    const progressSnap = await getDoc(progressRef);

    const newEntry = {
      grade,
      subject,
      totalQuestions: testData.questions.length,
      correctAnswers: testData.correct,
      percentage: (testData.correct / testData.questions.length) * 100,
      timestamp: new Date().toISOString()
    };

    if (progressSnap.exists()) {
      const data = progressSnap.data();
      const key = `${grade}_${subject}`;
      const existingTests = data[key] || [];
      
      await updateDoc(progressRef, {
        [key]: [...existingTests, newEntry]
      });
    } else {
      const key = `${grade}_${subject}`;
      await setDoc(progressRef, {
        [key]: [newEntry],
        userId,
        createdAt: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error saving progress:', error);
    throw error;
  }
};

export const getStudentProgress = async (userId) => {
  try {
    const progressRef = doc(db, 'studentProgress', userId);
    const progressSnap = await getDoc(progressRef);

    if (progressSnap.exists()) {
      const data = progressSnap.data();
      const progress = {};

      Object.entries(data).forEach(([key, value]) => {
        if (key !== 'userId' && key !== 'createdAt' && Array.isArray(value)) {
          const [grade, subject] = key.split('_');
          if (!progress[grade]) progress[grade] = {};
          progress[grade][subject] = value;
        }
      });

      return progress;
    }
    
    return {};
  } catch (error) {
    console.error('Error fetching progress:', error);
    return {};
  }
};