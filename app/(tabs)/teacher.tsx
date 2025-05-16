import { Colors } from '@/constants/Colors';
import { ClassEvent, useSchedule } from '@/contexts/ScheduleContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';

export default function TeacherScreen() {
  const colorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<any>({ [selectedDate]: { selected: true } });
  
  // Get data and functions from context
  const { 
    classes, 
    addClassEvent, 
    removeClassEvent, 
    teacherOffDays, 
    toggleTeacherOffDay 
  } = useSchedule();
  
  // Form state
  const [className, setClassName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  
  // Update marked dates whenever classes or off days change
  useEffect(() => {
    updateMarkedDates();
  }, [classes, teacherOffDays, selectedDate]);
  
  const updateMarkedDates = () => {
    const newMarkedDates: any = {};
    
    // Mark dates with classes
    classes.forEach(classEvent => {
      if (!newMarkedDates[classEvent.date]) {
        newMarkedDates[classEvent.date] = {
          marked: true,
          dotColor: '#5B8E7D'
        };
      }
    });
    
    // Mark off days
    teacherOffDays.forEach(date => {
      if (!newMarkedDates[date]) {
        newMarkedDates[date] = {
          marked: true,
          dotColor: '#FF6B6B'
        };
      } else {
        newMarkedDates[date].dotColor = '#FF6B6B';
      }
    });
    
    // Make sure selected date is marked as selected
    if (newMarkedDates[selectedDate]) {
      newMarkedDates[selectedDate] = {
        ...newMarkedDates[selectedDate],
        selected: true,
        selectedColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
      };
    } else {
      newMarkedDates[selectedDate] = {
        selected: true,
        selectedColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
      };
    }
    
    setMarkedDates(newMarkedDates);
  };
  
  const handleAddClass = () => {
    if (!className || !startTime || !endTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }
    
    const newClass: ClassEvent = {
      id: Date.now().toString(),
      title: className,
      startTime,
      endTime,
      location,
      date: selectedDate,
    };
    
    addClassEvent(newClass);
    
    // Reset form
    setClassName('');
    setStartTime('');
    setEndTime('');
    setLocation('');
    
    Alert.alert('Success', 'Class added successfully');
  };
  
  const getClassesForSelectedDate = () => {
    return classes.filter(c => c.date === selectedDate);
  };
  
  const isSelectedDateOffDay = () => {
    return teacherOffDays.includes(selectedDate);
  };
  
  const handleDeleteClass = (classId: string) => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => removeClassEvent(classId)
        },
      ]
    );
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Teacher Schedule
        </Text>
      </View>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: Colors[colorScheme ?? 'light'].text,
              selectedDayBackgroundColor: Colors[colorScheme ?? 'light'].tint,
              selectedDayTextColor: '#ffffff',
              todayTextColor: Colors[colorScheme ?? 'light'].tint,
              dayTextColor: Colors[colorScheme ?? 'light'].text,
              textDisabledColor: Colors[colorScheme ?? 'light'].tabIconDefault,
              monthTextColor: Colors[colorScheme ?? 'light'].text,
              indicatorColor: Colors[colorScheme ?? 'light'].tint,
            }}
          />
        </View>
        
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#5B8E7D' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Class</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Off Day</Text>
          </View>
        </View>
        
        <View style={styles.dateSection}>
          <Text style={[styles.dateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          
          <TouchableOpacity
            style={[
              styles.offDayButton,
              { backgroundColor: isSelectedDateOffDay() ? '#FF6B6B' : Colors[colorScheme ?? 'light'].cardBackground }
            ]}
            onPress={() => toggleTeacherOffDay(selectedDate)}
          >
            <Text style={{ 
              color: isSelectedDateOffDay() ? 'white' : Colors[colorScheme ?? 'light'].text,
              fontWeight: '600'
            }}>
              {isSelectedDateOffDay() ? 'Mark as Working Day' : 'Mark as Off Day'}
            </Text>
          </TouchableOpacity>
        </View>
        
        {!isSelectedDateOffDay() && (
          <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.05)'} style={styles.shadowContainer}>
            <View style={[styles.formCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
              <Text style={[styles.formTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Add Class
              </Text>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Class Name*</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[colorScheme ?? 'light'].text,
                      backgroundColor: colorScheme === 'dark' ? '#2c2e32' : '#f0f0f0'
                    }
                  ]}
                  placeholder="E.g. Math 101"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  value={className}
                  onChangeText={setClassName}
                />
              </View>
              
              <View style={styles.timeContainer}>
                <View style={[styles.formGroup, { flex: 1, marginRight: 8 }]}>
                  <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Start Time*</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: Colors[colorScheme ?? 'light'].text,
                        backgroundColor: colorScheme === 'dark' ? '#2c2e32' : '#f0f0f0'
                      }
                    ]}
                    placeholder="09:00"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                    value={startTime}
                    onChangeText={setStartTime}
                  />
                </View>
                
                <View style={[styles.formGroup, { flex: 1, marginLeft: 8 }]}>
                  <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>End Time*</Text>
                  <TextInput
                    style={[
                      styles.input,
                      { 
                        color: Colors[colorScheme ?? 'light'].text,
                        backgroundColor: colorScheme === 'dark' ? '#2c2e32' : '#f0f0f0'
                      }
                    ]}
                    placeholder="10:30"
                    placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                    value={endTime}
                    onChangeText={setEndTime}
                  />
                </View>
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Location</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[colorScheme ?? 'light'].text,
                      backgroundColor: colorScheme === 'dark' ? '#2c2e32' : '#f0f0f0'
                    }
                  ]}
                  placeholder="Room 101"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddClass}
              >
                <Text style={styles.addButtonText}>Add Class</Text>
              </TouchableOpacity>
            </View>
          </Shadow>
        )}
        
        <View style={styles.classesSection}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {isSelectedDateOffDay() ? 'Off Day - No Classes' : 'Classes for this Day'}
          </Text>
          
          {!isSelectedDateOffDay() && (
            getClassesForSelectedDate().length > 0 ? (
              getClassesForSelectedDate().map(classItem => (
                <Shadow key={classItem.id} distance={5} startColor={'rgba(0, 0, 0, 0.05)'} style={styles.shadowContainer}>
                  <View style={[
                    styles.classCard,
                    { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground },
                    { borderLeftWidth: 4, borderLeftColor: '#5B8E7D' }
                  ]}>
                    <View style={styles.classCardHeader}>
                      <Text style={[styles.classTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {classItem.title}
                      </Text>
                      <TouchableOpacity onPress={() => handleDeleteClass(classItem.id)}>
                        <Text style={[styles.deleteButton, { color: '#FF6B6B' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={styles.classDetails}>
                      <Text style={[styles.classTime, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {classItem.startTime} - {classItem.endTime}
                      </Text>
                      {classItem.location && (
                        <Text style={[styles.classLocation, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          Location: {classItem.location}
                        </Text>
                      )}
                    </View>
                  </View>
                </Shadow>
              ))
            ) : (
              <Text style={[styles.noClasses, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No classes scheduled for this day. Add a class using the form above.
              </Text>
            )
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  scrollContainer: {
    flex: 1,
  },
  calendarContainer: {
    paddingHorizontal: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  dateSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  offDayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  shadowContainer: {
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  formCard: {
    padding: 16,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  timeContainer: {
    flexDirection: 'row',
  },
  addButton: {
    backgroundColor: '#5B8E7D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
  classesSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  classCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  classCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  classTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  classDetails: {
    marginTop: 4,
  },
  classTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  classLocation: {
    fontSize: 14,
  },
  noClasses: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});