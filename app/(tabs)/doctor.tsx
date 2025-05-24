import { Colors } from '@/constants/Colors';
import { ShiftType, useSchedule } from '@/contexts/ScheduleContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';

export default function DoctorScreen() {
  const colorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<any>({ [selectedDate]: { selected: true } });
  
  // Get data and functions from context
  const { 
    shifts, 
    addShiftEvent, 
    removeShiftEvent, 
    doctorOffDays, 
    toggleDoctorOffDay, 
    onCallDays, 
    toggleOnCallDay 
  } = useSchedule();
  
  // Form state
  const [shiftTitle, setShiftTitle] = useState('');
  const [shiftType, setShiftType] = useState<ShiftType>('morning');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('');
  const [isOnCall, setIsOnCall] = useState(false);
  
  // Update marked dates whenever shifts, off days or on-call days change
  useEffect(() => {
    updateMarkedDates();
  }, [shifts, doctorOffDays, onCallDays, selectedDate, colorScheme]);
  
  // Update isOnCall state when selected date changes
  useEffect(() => {
    setIsOnCall(onCallDays.includes(selectedDate));
  }, [selectedDate, onCallDays]);
  
  // Add debugging to confirm UI re-renders with updated shifts
  useEffect(() => {
    console.log('Rendering shifts for selected date:', getShiftsForSelectedDate());
  }, [shifts, selectedDate]);
  
  // Update the `updateMarkedDates` function to ensure it correctly handles state updates and creates a new object reference for `markedDates`.
  const updateMarkedDates = () => {
    const newMarkedDates: any = {};

    // Mark dates with shifts
    shifts.forEach(shift => {
      if (!newMarkedDates[shift.date]) {
        newMarkedDates[shift.date] = {
          marked: true,
          dotColor: getShiftTypeColor(shift.type), // Use the color based on shift type
        };
      } else {
        // If the date already exists, ensure it supports multiple dots
        if (!newMarkedDates[shift.date].dots) {
          newMarkedDates[shift.date].dots = [
            { key: shift.type, color: getShiftTypeColor(shift.type) },
          ];
        } else {
          newMarkedDates[shift.date].dots.push({ key: shift.type, color: getShiftTypeColor(shift.type) });
        }
      }
    });

    // Mark off days
    doctorOffDays.forEach(date => {
      const isOnCallDay = onCallDays.includes(date);

      if (isOnCallDay) {
        // Both off day and on-call
        newMarkedDates[date] = {
          marked: true,
          dots: [
            { key: 'offday', color: '#FF6B6B' },
            { key: 'oncall', color: '#4D96FF' },
          ],
        };
      } else if (!newMarkedDates[date]) {
        // Just off day
        newMarkedDates[date] = {
          marked: true,
          dotColor: '#FF6B6B',
        };
      } else {
        newMarkedDates[date].dotColor = '#FF6B6B';
      }
    });

    // Mark on-call days (if not already marked as both)
    onCallDays.forEach(date => {
      const isOffDay = doctorOffDays.includes(date);

      if (!isOffDay && !newMarkedDates[date]) {
        newMarkedDates[date] = {
          marked: true,
          dotColor: '#4D96FF',
        };
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

    // Update the state with a new object reference
    setMarkedDates({ ...newMarkedDates });
  };
  
  const handleAddShift = () => {
    if (!shiftTitle || !startTime || !endTime) {
      Alert.alert('Missing Information', 'Please fill in all required fields');
      return;
    }

    addShiftEvent({
      title: shiftTitle,
      startTime,
      endTime,
      location,
      date: selectedDate,
      type: shiftType,
    });

    // Reset form
    setShiftTitle('');
    setShiftType('morning');
    setStartTime('');
    setEndTime('');
    setLocation('');

    Alert.alert('Success', 'Shift added successfully');
  };
  
  const handleToggleOffDay = () => {
    toggleDoctorOffDay(selectedDate);
  };
  
  const handleToggleOnCall = () => {
    const newIsOnCall = !isOnCall;
    setIsOnCall(newIsOnCall);
    toggleOnCallDay(selectedDate);
  };
  
  const getShiftsForSelectedDate = () => {
    return shifts.filter(s => s.date === selectedDate);
  };
  
  const isSelectedDateOffDay = () => {
    return doctorOffDays.includes(selectedDate);
  };
  
  const isSelectedDateOnCall = () => {
    return onCallDays.includes(selectedDate);
  };
  
  // Add debugging to ensure the correct shift ID is passed to removeShiftEvent
  const handleDeleteShift = (shiftId: string) => {
    console.log('Attempting to delete shift with ID:', shiftId); // Debugging log
    Alert.alert(
      'Delete Shift',
      'Are you sure you want to delete this shift?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: () => {
            try {
              removeShiftEvent(shiftId);
              console.log('Shift deleted successfully'); // Debugging log
            } catch (error) {
              console.error('Error deleting shift:', error); // Debugging log
            }
          }
        },
      ]
    );
  };
  
  const getShiftTypeColor = (type: ShiftType) => {
    switch (type) {
      case 'morning':
        return '#F4845F';
      case 'afternoon':
        return '#E9C46A';
      case 'night':
        return '#5E60CE';
      case 'oncall':
        return '#4D96FF';
      default:
        return '#F4845F';
    }
  };
  
  const getShiftTypeName = (type: ShiftType) => {
    switch (type) {
      case 'morning':
        return 'Morning Shift';
      case 'afternoon':
        return 'Afternoon Shift';
      case 'night':
        return 'Night Shift';
      case 'oncall':
        return 'On-Call Duty';
      default:
        return 'Shift';
    }
  };
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Doctor Schedule
        </Text>
      </View>
      
      <ScrollView style={styles.scrollContainer} contentContainerStyle={{ paddingBottom: 50 }}>
        <View style={styles.calendarContainer}>
          <Calendar
            onDayPress={(day) => setSelectedDate(day.dateString)}
            markedDates={markedDates}
            markingType={'dot'} // Changed from 'multi-dot' to 'dot' to match the `markedDates` structure
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
            <View style={[styles.legendDot, { backgroundColor: '#F4845F' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Shift</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Off Day</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4D96FF' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>On-Call</Text>
          </View>
        </View>
        
        <View style={styles.dateSection}>
          <Text style={[styles.dateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </Text>
          
          <View style={styles.dayStatusContainer}>
            <TouchableOpacity
              style={[
                styles.offDayButton,
                { backgroundColor: isSelectedDateOffDay() ? '#FF6B6B' : Colors[colorScheme ?? 'light'].cardBackground }
              ]}
              onPress={handleToggleOffDay}
            >
              <Text style={{ 
                color: isSelectedDateOffDay() ? 'white' : Colors[colorScheme ?? 'light'].text,
                fontWeight: '600'
              }}>
                {isSelectedDateOffDay() ? 'Mark as Working Day' : 'Mark as Off Day'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.onCallContainer}>
              <Text style={{ color: Colors[colorScheme ?? 'light'].text, marginRight: 8 }}>On-Call</Text>
              <Switch
                value={isOnCall}
                onValueChange={handleToggleOnCall}
                trackColor={{ false: '#767577', true: '#4D96FF' }}
                thumbColor={'#f4f3f4'}
              />
            </View>
          </View>
        </View>
        
        {!isSelectedDateOffDay() && (
          <Shadow distance={5} startColor={'rgba(0, 0, 0, 0.05)'} style={styles.shadowContainer}>
            <View style={[styles.formCard, { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }]}>
              <Text style={[styles.formTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                Add Shift
              </Text>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Shift Title*</Text>
                <TextInput
                  style={[
                    styles.input,
                    { 
                      color: Colors[colorScheme ?? 'light'].text,
                      backgroundColor: colorScheme === 'dark' ? '#2c2e32' : '#f0f0f0'
                    }
                  ]}
                  placeholder="E.g. Emergency Department"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  value={shiftTitle}
                  onChangeText={setShiftTitle}
                />
              </View>
              
              <View style={styles.formGroup}>
                <Text style={[styles.label, { color: Colors[colorScheme ?? 'light'].text }]}>Shift Type</Text>
                <View style={styles.shiftTypeContainer}>
                  <TouchableOpacity
                    style={[
                      styles.shiftTypeButton,
                      { backgroundColor: shiftType === 'morning' 
                        ? '#F4845F' 
                        : colorScheme === 'dark' ? '#2c2e32' : '#e0e0e0' }
                    ]}
                    onPress={() => setShiftType('morning')}
                  >
                    <Text style={{ 
                      color: shiftType === 'morning' ? 'black' : Colors[colorScheme ?? 'light'].text
                    }}>
                      Morning
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.shiftTypeButton,
                      { backgroundColor: shiftType === 'afternoon'
                        ? '#E9C46A' 
                        : colorScheme === 'dark' ? '#2c2e32' : '#e0e0e0' }
                    ]}
                    onPress={() => setShiftType('afternoon')}
                  >
                    <Text style={{ 
                      color: shiftType === 'afternoon' ? 'white' : Colors[colorScheme ?? 'light'].text
                    }}>
                      Afternoon
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.shiftTypeButton,
                      { backgroundColor: shiftType === 'night'
                        ? '#5E60CE' 
                        : colorScheme === 'dark' ? '#2c2e32' : '#e0e0e0' }
                    ]}
                    onPress={() => setShiftType('night')}
                  >
                    <Text style={{ 
                      color: shiftType === 'night' ? 'white' : Colors[colorScheme ?? 'light'].text
                    }}>
                      Night
                    </Text>
                  </TouchableOpacity>
                  
                  {/* <TouchableOpacity 
                    style={[
                      styles.shiftTypeButton,
                      shiftType === 'oncall' && { backgroundColor: '#4D96FF' }
                    ]}
                    onPress={() => setShiftType('oncall')}
                  >
                    <Text style={{ 
                      color: shiftType === 'oncall' ? 'white' : Colors[colorScheme ?? 'light'].text
                    }}>
                      On-Call
                    </Text>
                  </TouchableOpacity> */}
                </View>
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
                    placeholder="17:00"
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
                  placeholder="Emergency Department"
                  placeholderTextColor={Colors[colorScheme ?? 'light'].textSecondary}
                  value={location}
                  onChangeText={setLocation}
                />
              </View>
              
              <TouchableOpacity
                style={styles.addButton}
                onPress={handleAddShift}
              >
                <Text style={styles.addButtonText}>Add Shift</Text>
              </TouchableOpacity>
            </View>
          </Shadow>
        )}
        
        <View style={styles.shiftsSection}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
            {isSelectedDateOffDay() ? 'Off Day' : 'Shifts for this Day'}
            {isSelectedDateOnCall() && ' (On-Call)'}
          </Text>
          
          {isSelectedDateOffDay() ? (
            <View style={[
              styles.offDayCard,
              { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground }
            ]}>
              <Text style={{ color: Colors[colorScheme ?? 'light'].text, textAlign: 'center' }}>
                This is a day off.
                {isSelectedDateOnCall() && ' However, you are on-call for this day.'}
              </Text>
            </View>
          ) : (
            getShiftsForSelectedDate().length > 0 ? (
              getShiftsForSelectedDate().map(shift => (
                <Shadow key={shift.id} distance={5} startColor={'rgba(0, 0, 0, 0.05)'} style={styles.shadowContainer}>
                  <View style={[
                    styles.shiftCard,
                    { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground },
                    { borderLeftWidth: 4, borderLeftColor: getShiftTypeColor(shift.type) }
                  ]}>
                    <View style={styles.shiftCardHeader}>
                      <Text style={[styles.shiftTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
                        {shift.title}
                      </Text>
                      <TouchableOpacity onPress={() => handleDeleteShift(shift.id)}>
                        <Text style={[styles.deleteButton, { color: '#FF6B6B' }]}>Delete</Text>
                      </TouchableOpacity>
                    </View>
                    
                    <View style={[styles.typeTag, { backgroundColor: getShiftTypeColor(shift.type) }]}>
                      <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>
                        {getShiftTypeName(shift.type)}
                      </Text>
                    </View>
                    
                    <View style={styles.shiftDetails}>
                      <Text style={[styles.shiftTime, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                        {shift.startTime} - {shift.endTime}
                      </Text>
                      {shift.location && (
                        <Text style={[styles.shiftLocation, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                          Location: {shift.location}
                        </Text>
                      )}
                    </View>
                  </View>
                </Shadow>
              ))
            ) : (
              <Text style={[styles.noShifts, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
                No shifts scheduled for this day. Add a shift using the form above.
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
    flexDirection: 'column',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  dateTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
  },
  dayStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  offDayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  onCallContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
  shiftTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shiftTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: '#e0e0e0',
    marginRight: 8,
  },
  addButton: {
    backgroundColor: '#F4845F',
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
  shiftsSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  shiftCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  shiftCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  shiftTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    fontSize: 14,
    fontWeight: '500',
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  shiftDetails: {
    marginTop: 4,
  },
  shiftTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  shiftLocation: {
    fontSize: 14,
  },
  noShifts: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  offDayCard: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B6B',
  },
});