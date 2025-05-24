import {
  addClass,
  addDoctorOffDay,
  addOnCallDay,
  addShift,
  addTeacherOffDay,
  deleteClass,
  deleteDoctorOffDay,
  deleteOnCallDay,
  deleteShift,
  deleteTeacherOffDay,
  fetchClasses,
  fetchDoctorOffDays,
  fetchOnCallDays,
  fetchShifts,
  fetchTeacherOffDays
} from '@/services/firebaseService';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

// Define types
type EventType = 'class' | 'shift' | 'oncall' | 'offday';
type UserType = 'teacher' | 'doctor';

export interface ScheduleEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  type: EventType;
  user: UserType;
  details?: string;
  date: string;
  shiftType?: ShiftType;
}

export interface ClassEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  date: string;
}

export type ShiftType = 'morning' | 'afternoon' | 'night' | 'oncall';

export interface ShiftEvent {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  date: string;
  type: ShiftType;
}

interface ScheduleContextType {
  events: Record<string, ScheduleEvent[]>;
  addEvent: (event: ScheduleEvent) => void;
  removeEvent: (eventId: string) => void;
  loading: boolean;
  // Teacher specific
  classes: ClassEvent[];
  addClassEvent: (classEvent: Omit<ClassEvent, 'id'>) => Promise<void>;
  removeClassEvent: (eventId: string) => Promise<void>;
  teacherOffDays: string[];
  toggleTeacherOffDay: (date: string) => Promise<void>;
  // Doctor specific
  shifts: ShiftEvent[];
  addShiftEvent: (shiftEvent: Omit<ShiftEvent, 'id'>) => Promise<void>;
  removeShiftEvent: (eventId: string) => Promise<void>;
  doctorOffDays: string[];
  toggleDoctorOffDay: (date: string) => Promise<void>;
  onCallDays: string[];
  toggleOnCallDay: (date: string) => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | undefined>(undefined);

// Helper function to get current date string
const getDateString = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// Helper to get example dates
const getExampleDate = (daysToAdd: number) => {
  const date = new Date();
  date.setDate(date.getDate() + daysToAdd);
  return getDateString(date);
};

// Sample data - used as fallback when Firebase operations fail
const getSampleData = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfterTomorrow = new Date(today);
  dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
  
  const todayStr = today.toISOString().split('T')[0];
  const tomorrowStr = tomorrow.toISOString().split('T')[0];
  const dayAfterTomorrowStr = dayAfterTomorrow.toISOString().split('T')[0];
  
  return {
    classes: [
      {
        id: 'sample-class-1',
        title: 'Math 101',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Room A101',
        date: todayStr,
      },
      {
        id: 'sample-class-2',
        title: 'English Literature',
        startTime: '13:00',
        endTime: '14:30',
        location: 'Room B202',
        date: tomorrowStr,
      },
    ],
    shifts: [
      {
        id: 'sample-shift-1',
        title: 'Morning Shift',
        startTime: '08:00',
        endTime: '16:00',
        location: 'General Ward',
        date: todayStr,
        type: 'morning' as ShiftType,
      },
      {
        id: 'sample-shift-2',
        title: 'Night Shift',
        startTime: '22:00',
        endTime: '06:00',
        location: 'Emergency Room',
        date: tomorrowStr,
        type: 'night' as ShiftType,
      },
    ],
    teacherOffDays: [dayAfterTomorrowStr],
    doctorOffDays: [dayAfterTomorrowStr],
    onCallDays: [tomorrowStr],
  };
};

export const ScheduleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Combined events for the main calendar
  const [events, setEvents] = useState<Record<string, ScheduleEvent[]>>({});
  const [loading, setLoading] = useState(true);
  
  // Teacher state
  const [classes, setClasses] = useState<ClassEvent[]>([]);
  const [teacherOffDays, setTeacherOffDays] = useState<string[]>([]);
  
  // Doctor state
  const [shifts, setShifts] = useState<ShiftEvent[]>([]);
  const [doctorOffDays, setDoctorOffDays] = useState<string[]>([]);
  const [onCallDays, setOnCallDays] = useState<string[]>([]);

  // Fetch all data from Firebase on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        let firebaseError = false;
        let permissionError = false;
        
        try {
          // Fetch classes
          const classesData = await fetchClasses();
          setClasses(classesData);
        } catch (classError) {
          console.error("Error fetching classes:", classError);
          firebaseError = true;
          
          // Check for permission errors
          if (classError instanceof Error && 
              classError.toString().includes('Missing or insufficient permissions')) {
            permissionError = true;
          }
          
          // Set empty classes temporarily
          setClasses([]);
        }
        
        try {
          // Fetch shifts
          const shiftsData = await fetchShifts();
          setShifts(shiftsData);
        } catch (shiftError) {
          console.error("Error fetching shifts:", shiftError);
          firebaseError = true;
          
          // Check for permission errors
          if (shiftError instanceof Error && 
              shiftError.toString().includes('Missing or insufficient permissions')) {
            permissionError = true;
          }
          
          // Set empty shifts temporarily
          setShifts([]);
        }
        
        try {
          // Fetch teacher off days
          const teacherOffDaysData = await fetchTeacherOffDays();
          setTeacherOffDays(teacherOffDaysData);
        } catch (teacherOffDaysError) {
          console.error("Error fetching teacher off days:", teacherOffDaysError);
          firebaseError = true;
          
          // Check for permission errors
          if (teacherOffDaysError instanceof Error && 
              teacherOffDaysError.toString().includes('Missing or insufficient permissions')) {
            permissionError = true;
          }
          
          // Set empty teacher off days temporarily
          setTeacherOffDays([]);
        }
        
        try {
          // Fetch doctor off days
          const doctorOffDaysData = await fetchDoctorOffDays();
          setDoctorOffDays(doctorOffDaysData);
        } catch (doctorOffDaysError) {
          console.error("Error fetching doctor off days:", doctorOffDaysError);
          firebaseError = true;
          
          // Check for permission errors
          if (doctorOffDaysError instanceof Error && 
              doctorOffDaysError.toString().includes('Missing or insufficient permissions')) {
            permissionError = true;
          }
          
          // Set empty doctor off days temporarily
          setDoctorOffDays([]);
        }
        
        try {
          // Fetch on-call days
          const onCallDaysData = await fetchOnCallDays();
          setOnCallDays(onCallDaysData);
        } catch (onCallDaysError) {
          console.error("Error fetching on-call days:", onCallDaysError);
          firebaseError = true;
          
          // Check for permission errors
          if (onCallDaysError instanceof Error && 
              onCallDaysError.toString().includes('Missing or insufficient permissions')) {
            permissionError = true;
          }
          
          // Set empty on-call days temporarily
          setOnCallDays([]);
        }
        
        // If there were any Firebase permission errors, show a helpful message
        if (permissionError) {
          console.log("Firebase permission errors detected. Please follow the instructions in FIREBASE_SETUP.md");
        }
        
        // If there were any Firebase errors, load sample data
        if (firebaseError) {
          console.log("Using sample data due to Firebase errors");
          const sampleData = getSampleData();
          setClasses(sampleData.classes);
          setShifts(sampleData.shifts);
          setTeacherOffDays(sampleData.teacherOffDays);
          setDoctorOffDays(sampleData.doctorOffDays);
          setOnCallDays(sampleData.onCallDays);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        
        // Fall back to sample data
        const sampleData = getSampleData();
        setClasses(sampleData.classes);
        setShifts(sampleData.shifts);
        setTeacherOffDays(sampleData.teacherOffDays);
        setDoctorOffDays(sampleData.doctorOffDays);
        setOnCallDays(sampleData.onCallDays);
        
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Update the combined events whenever individual components change
  useEffect(() => {
    const newEvents: Record<string, ScheduleEvent[]> = {};
    
    // Add teacher classes to events
    classes.forEach(classEvent => {
      const event: ScheduleEvent = {
        id: `teacher-class-${classEvent.id}`,
        title: classEvent.title,
        startTime: classEvent.startTime,
        endTime: classEvent.endTime,
        type: 'class',
        user: 'teacher',
        details: classEvent.location,
        date: classEvent.date
      };
      
      if (!newEvents[classEvent.date]) {
        newEvents[classEvent.date] = [];
      }
      
      newEvents[classEvent.date].push(event);
    });
    
    // Add teacher off days to events
    teacherOffDays.forEach(date => {
      const event: ScheduleEvent = {
        id: `teacher-offday-${date}`,
        title: 'Teacher Off Day',
        startTime: 'All Day',
        endTime: '',
        type: 'offday',
        user: 'teacher',
        date: date
      };
      
      if (!newEvents[date]) {
        newEvents[date] = [];
      }
      
      newEvents[date].push(event);
    });
    
    // Add doctor shifts to events
    shifts.forEach(shift => {
      const event: ScheduleEvent = {
        id: `doctor-shift-${shift.id}`,
        title: shift.title,
        startTime: shift.startTime,
        endTime: shift.endTime,
        type: 'shift',
        user: 'doctor',
        details: shift.location,
        date: shift.date,
        shiftType: shift.type, // Ensure shiftType is included
      };

      if (!newEvents[shift.date]) {
        newEvents[shift.date] = [];
      }

      newEvents[shift.date].push(event);
    });
    
    // Add doctor off days to events
    doctorOffDays.forEach(date => {
      const event: ScheduleEvent = {
        id: `doctor-offday-${date}`,
        title: 'Doctor Off Day',
        startTime: 'All Day',
        endTime: '',
        type: 'offday',
        user: 'doctor',
        date: date
      };
      
      if (!newEvents[date]) {
        newEvents[date] = [];
      }
      
      newEvents[date].push(event);
    });
    
    // Add on-call days to events
    onCallDays.forEach(date => {
      const event: ScheduleEvent = {
        id: `doctor-oncall-${date}`,
        title: 'On-Call Duty',
        startTime: 'All Day',
        endTime: '',
        type: 'oncall',
        user: 'doctor',
        date: date
      };
      
      if (!newEvents[date]) {
        newEvents[date] = [];
      }
      
      newEvents[date].push(event);
    });
    
    setEvents(newEvents);
  }, [classes, teacherOffDays, shifts, doctorOffDays, onCallDays]);

  // Functions to add and remove events
  const addEvent = (event: ScheduleEvent) => {
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      if (!newEvents[event.date]) {
        newEvents[event.date] = [];
      }
      newEvents[event.date] = [...newEvents[event.date], event];
      return newEvents;
    });
  };

  const removeEvent = (eventId: string) => {
    setEvents(prevEvents => {
      const newEvents = { ...prevEvents };
      Object.keys(newEvents).forEach(date => {
        newEvents[date] = newEvents[date].filter(event => event.id !== eventId);
        if (newEvents[date].length === 0) {
          delete newEvents[date];
        }
      });
      return newEvents;
    });
  };

  // Teacher-specific functions
  const addClassEvent = async (classEvent: Omit<ClassEvent, 'id'>) => {
    try {
      const id = await addClass(classEvent);
      setClasses(prevClasses => [...prevClasses, { ...classEvent, id }]);
    } catch (error) {
      console.error("Error adding class:", error);
      throw error;
    }
  };

  const removeClassEvent = async (eventId: string) => {
    try {
      console.log(`Removing class event with ID: ${eventId}`); // Debugging log
      await deleteClass(eventId); // Ensure the backend class is deleted
      setClasses(prevClasses => {
        const updatedClasses = prevClasses.filter(classEvent => classEvent.id !== eventId);
        console.log('Updated classes after deletion:', updatedClasses); // Debugging log
        return updatedClasses;
      });
    } catch (error) {
      console.error(`Error removing class event with ID: ${eventId}`, error); // Debugging log
      throw error;
    }
  };

  const toggleTeacherOffDay = async (date: string) => {
    try {
      if (teacherOffDays.includes(date)) {
        await deleteTeacherOffDay(date);
        setTeacherOffDays(prevOffDays => prevOffDays.filter(d => d !== date));
      } else {
        await addTeacherOffDay(date);
        setTeacherOffDays(prevOffDays => [...prevOffDays, date]);
      }
    } catch (error) {
      console.error("Error toggling teacher off day:", error);
      throw error;
    }
  };

  // Doctor-specific functions
  const addShiftEvent = async (shiftEvent: Omit<ShiftEvent, 'id'>) => {
    try {
      const id = await addShift(shiftEvent);
      setShifts(prevShifts => [...prevShifts, { ...shiftEvent, id }]);
    } catch (error) {
      console.error("Error adding shift:", error);
      throw error;
    }
  };

  const removeShiftEvent = async (eventId: string) => {
    try {
      console.log(`Removing shift event with ID: ${eventId}`); // Debugging log
      await deleteShift(eventId); // Ensure the backend shift is deleted
      console.log(`Shift with ID: ${eventId} passed to deleteShift`); // Debugging log
      setShifts(prevShifts => {
        const updatedShifts = prevShifts.filter(shift => shift.id !== eventId);
        console.log('Updated shifts after deletion:', updatedShifts); // Debugging log
        return updatedShifts;
      });
    } catch (error) {
      console.error(`Error removing shift event with ID: ${eventId}`, error); // Debugging log
      throw error;
    }
  };

  const toggleDoctorOffDay = async (date: string) => {
    try {
      if (doctorOffDays.includes(date)) {
        await deleteDoctorOffDay(date);
        setDoctorOffDays(prevOffDays => prevOffDays.filter(d => d !== date));
      } else {
        await addDoctorOffDay(date);
        setDoctorOffDays(prevOffDays => [...prevOffDays, date]);
      }
    } catch (error) {
      console.error("Error toggling doctor off day:", error);
      throw error;
    }
  };

  const toggleOnCallDay = async (date: string) => {
    try {
      if (onCallDays.includes(date)) {
        await deleteOnCallDay(date);
        setOnCallDays(prevOnCallDays => prevOnCallDays.filter(d => d !== date));
      } else {
        await addOnCallDay(date);
        setOnCallDays(prevOnCallDays => [...prevOnCallDays, date]);
      }
    } catch (error) {
      console.error("Error toggling on-call day:", error);
      throw error;
    }
  };

  const value = {
    events,
    addEvent,
    removeEvent,
    loading,
    classes,
    addClassEvent,
    removeClassEvent,
    teacherOffDays,
    toggleTeacherOffDay,
    shifts,
    addShiftEvent,
    removeShiftEvent,
    doctorOffDays,
    toggleDoctorOffDay,
    onCallDays,
    toggleOnCallDay
  };

  return <ScheduleContext.Provider value={value}>{children}</ScheduleContext.Provider>;
};

export const useSchedule = () => {
  const context = useContext(ScheduleContext);
  if (context === undefined) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }
  return context;
};