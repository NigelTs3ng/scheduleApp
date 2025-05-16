import { db } from '@/config/firebase';
import { ClassEvent, ShiftEvent } from '@/contexts/ScheduleContext';
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    Firestore,
    getDocs,
    setDoc
} from 'firebase/firestore';

// Collections
const CLASSES_COLLECTION = 'classes';
const SHIFTS_COLLECTION = 'shifts';
const TEACHER_OFFDAYS_COLLECTION = 'teacherOffDays';
const DOCTOR_OFFDAYS_COLLECTION = 'doctorOffDays';
const ONCALL_DAYS_COLLECTION = 'onCallDays';

// Handle case when Firestore is not initialized
const getDb = (): Firestore => {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  return db;
};

// Classes
export const fetchClasses = async (): Promise<ClassEvent[]> => {
  try {
    const firestore = getDb();
    const classesSnapshot = await getDocs(collection(firestore, CLASSES_COLLECTION));
    return classesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ClassEvent));
  } catch (error) {
    console.error("Error fetching classes:", error);
    throw error;
  }
};

export const addClass = async (classEvent: Omit<ClassEvent, 'id'>): Promise<string> => {
  try {
    const firestore = getDb();
    const docRef = await addDoc(collection(firestore, CLASSES_COLLECTION), classEvent);
    return docRef.id;
  } catch (error) {
    console.error("Error adding class:", error);
    throw error;
  }
};

export const deleteClass = async (id: string): Promise<void> => {
  try {
    const firestore = getDb();
    await deleteDoc(doc(firestore, CLASSES_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting class:", error);
    throw error;
  }
};

// Shifts
export const fetchShifts = async (): Promise<ShiftEvent[]> => {
  try {
    const firestore = getDb();
    const shiftsSnapshot = await getDocs(collection(firestore, SHIFTS_COLLECTION));
    return shiftsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ShiftEvent));
  } catch (error) {
    console.error("Error fetching shifts:", error);
    throw error;
  }
};

export const addShift = async (shiftEvent: Omit<ShiftEvent, 'id'>): Promise<string> => {
  try {
    const firestore = getDb();
    const docRef = await addDoc(collection(firestore, SHIFTS_COLLECTION), shiftEvent);
    return docRef.id;
  } catch (error) {
    console.error("Error adding shift:", error);
    throw error;
  }
};

export const deleteShift = async (id: string): Promise<void> => {
  try {
    const firestore = getDb();
    await deleteDoc(doc(firestore, SHIFTS_COLLECTION, id));
  } catch (error) {
    console.error("Error deleting shift:", error);
    throw error;
  }
};

// Teacher Off Days
export const fetchTeacherOffDays = async (): Promise<string[]> => {
  try {
    const firestore = getDb();
    const snapshot = await getDocs(collection(firestore, TEACHER_OFFDAYS_COLLECTION));
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error fetching teacher off days:", error);
    throw error;
  }
};

export const addTeacherOffDay = async (date: string): Promise<void> => {
  try {
    const firestore = getDb();
    await setDoc(doc(firestore, TEACHER_OFFDAYS_COLLECTION, date), { date });
  } catch (error) {
    console.error("Error adding teacher off day:", error);
    throw error;
  }
};

export const deleteTeacherOffDay = async (date: string): Promise<void> => {
  try {
    const firestore = getDb();
    await deleteDoc(doc(firestore, TEACHER_OFFDAYS_COLLECTION, date));
  } catch (error) {
    console.error("Error deleting teacher off day:", error);
    throw error;
  }
};

// Doctor Off Days
export const fetchDoctorOffDays = async (): Promise<string[]> => {
  try {
    const firestore = getDb();
    const snapshot = await getDocs(collection(firestore, DOCTOR_OFFDAYS_COLLECTION));
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error fetching doctor off days:", error);
    throw error;
  }
};

export const addDoctorOffDay = async (date: string): Promise<void> => {
  try {
    const firestore = getDb();
    await setDoc(doc(firestore, DOCTOR_OFFDAYS_COLLECTION, date), { date });
  } catch (error) {
    console.error("Error adding doctor off day:", error);
    throw error;
  }
};

export const deleteDoctorOffDay = async (date: string): Promise<void> => {
  try {
    const firestore = getDb();
    await deleteDoc(doc(firestore, DOCTOR_OFFDAYS_COLLECTION, date));
  } catch (error) {
    console.error("Error deleting doctor off day:", error);
    throw error;
  }
};

// On-Call Days
export const fetchOnCallDays = async (): Promise<string[]> => {
  try {
    const firestore = getDb();
    const snapshot = await getDocs(collection(firestore, ONCALL_DAYS_COLLECTION));
    return snapshot.docs.map(doc => doc.id);
  } catch (error) {
    console.error("Error fetching on-call days:", error);
    throw error;
  }
};

export const addOnCallDay = async (date: string): Promise<void> => {
  try {
    const firestore = getDb();
    await setDoc(doc(firestore, ONCALL_DAYS_COLLECTION, date), { date });
  } catch (error) {
    console.error("Error adding on-call day:", error);
    throw error;
  }
};

export const deleteOnCallDay = async (date: string): Promise<void> => {
  try {
    const firestore = getDb();
    await deleteDoc(doc(firestore, ONCALL_DAYS_COLLECTION, date));
  } catch (error) {
    console.error("Error deleting on-call day:", error);
    throw error;
  }
}; 