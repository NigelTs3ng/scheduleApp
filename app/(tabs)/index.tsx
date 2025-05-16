import { Colors } from '@/constants/Colors';
import { ScheduleEvent, useSchedule } from '@/contexts/ScheduleContext';
import { useColorScheme } from '@/hooks/useColorScheme';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Shadow } from 'react-native-shadow-2';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [markedDates, setMarkedDates] = useState<any>({});
  const [userFilter, setUserFilter] = useState<'all' | 'teacher' | 'doctor'>('all');
  
  // Get events from context
  const { events } = useSchedule();

  // Update marked dates whenever events or filters change
  useEffect(() => {
    updateMarkedDates(events);
  }, [events, colorScheme, userFilter]);

  const updateMarkedDates = (eventData: Record<string, ScheduleEvent[]>) => {
    const marked: any = {};

    Object.keys(eventData).forEach(date => {
      const dateEvents = eventData[date];

      // Filter events based on userFilter
      const filteredEvents = userFilter === 'all' 
        ? dateEvents 
        : dateEvents.filter(e => e.user === userFilter);

      if (filteredEvents.length === 0) return;

      const dots = [];

      // Teacher class events
      if (filteredEvents.some(e => e.user === 'teacher' && e.type === 'class')) {
        dots.push({ key: 'teacher-class', color: '#5B8E7D' });
      }

      // Teacher off days
      if (filteredEvents.some(e => e.user === 'teacher' && e.type === 'offday')) {
        dots.push({ key: 'teacher-offday', color: '#FF6B6B' });
      }

      // Doctor shift events by type
      if (filteredEvents.some(e => e.user === 'doctor' && e.type === 'shift')) {
        filteredEvents.forEach(event => {
          if (event.type === 'shift' && event.shiftType) { // Ensure shiftType is defined
            const shiftColor = getShiftTypeColor(event.shiftType);
            dots.push({ key: `doctor-shift-${event.shiftType}`, color: shiftColor });
          }
        });
      }

      // Doctor on-call events
      if (filteredEvents.some(e => e.user === 'doctor' && e.type === 'oncall')) {
        dots.push({ key: 'doctor-oncall', color: '#4D96FF' });
      }

      // Doctor off days
      if (filteredEvents.some(e => e.user === 'doctor' && e.type === 'offday')) {
        dots.push({ key: 'doctor-offday', color: '#FF8C94' });
      }

      marked[date] = {
        marked: true,
        dots: dots,
        selected: date === selectedDate,
        selectedColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
      };
    });

    // Add selected date marking if it doesn't exist
    if (!marked[selectedDate]) {
      marked[selectedDate] = {
        selected: true,
        selectedColor: colorScheme === 'dark' ? '#333' : '#f0f0f0',
      };
    }

    setMarkedDates(marked);
  };

  const getShiftTypeColor = (shiftType: string) => {
    switch (shiftType) {
      case 'morning':
        return '#F4845F';
      case 'afternoon':
        return '#E9C46A';
      case 'night':
        return '#5E60CE';
      default:
        return '#F4845F';
    }
  };

  const getEventStyle = (event: ScheduleEvent) => {
    if (event.user === 'teacher') {
      return {
        backgroundColor: '#5B8E7D',
        borderColor: '#5B8E7D',
      };
    } else if (event.type === 'oncall') {
      return {
        backgroundColor: '#4D96FF',
        borderColor: '#4D96FF',
      };
    } else if (event.type === 'offday') {
      return {
        backgroundColor: '#FF6B6B',
        borderColor: '#FF6B6B',
      };
    } else if (event.type === 'shift' && event.shiftType) {
      const shiftColor = getShiftTypeColor(event.shiftType);
      return {
        backgroundColor: shiftColor,
        borderColor: shiftColor,
      };
    } else {
      return {
        backgroundColor: '#F4845F',
        borderColor: '#F4845F',
      };
    }
  };

  const getFilteredEventsForSelectedDate = () => {
    if (!events[selectedDate]) return [];
    
    return userFilter === 'all'
      ? events[selectedDate]
      : events[selectedDate].filter(e => e.user === userFilter);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors[colorScheme ?? 'light'].background }]}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          Schedule Calendar
        </Text>
      </View>
      
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: userFilter === 'all' 
              ? Colors[colorScheme ?? 'light'].tint 
              : colorScheme === 'dark' ? '#2c2e32' : '#e0e0e0' }
          ]}
          onPress={() => setUserFilter('all')}
        >
          <Text style={{ 
            color: userFilter === 'all' ? 'black' : Colors[colorScheme ?? 'light'].text,
            fontWeight: '500'
          }}>
            All
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: userFilter === 'teacher' 
              ? '#5B8E7D' 
              : colorScheme === 'dark' ? '#2c2e32' : '#e0e0e0' }
          ]}
          onPress={() => setUserFilter('teacher')}
        >
          <Text style={{ 
            color: userFilter === 'teacher' ? 'white' : Colors[colorScheme ?? 'light'].text,
            fontWeight: '500'
          }}>
            Teacher
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.filterButton,
            { backgroundColor: userFilter === 'doctor' 
              ? '#F4845F' 
              : colorScheme === 'dark' ? '#2c2e32' : '#e0e0e0' }
          ]}
          onPress={() => setUserFilter('doctor')}
        >
          <Text style={{ 
            color: userFilter === 'doctor' ? 'white' : Colors[colorScheme ?? 'light'].text,
            fontWeight: '500'
          }}>
            Doctor
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.calendarContainer}>
        <Calendar
          onDayPress={(day) => setSelectedDate(day.dateString)}
          markedDates={markedDates}
          markingType={'multi-dot'}
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
        <View style={styles.legendGroup}>
          <Text style={[styles.legendTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Teacher:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#5B8E7D' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Class</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF6B6B' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Off Day</Text>
          </View>
        </View>
        
        <View style={styles.legendGroup}>
          <Text style={[styles.legendTitle, { color: Colors[colorScheme ?? 'light'].text }]}>Doctor:</Text>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F4845F' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Shift</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#4D96FF' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>On-Call</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#FF8C94' }]} />
            <Text style={{ color: Colors[colorScheme ?? 'light'].text }}>Off Day</Text>
          </View>
        </View>
      </View>
      
      <View style={styles.eventsContainer}>
        <Text style={[styles.dateTitle, { color: Colors[colorScheme ?? 'light'].text }]}>
          {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </Text>
        
        <ScrollView style={styles.eventsList} contentContainerStyle={{ paddingBottom: 50 }}>
          {getFilteredEventsForSelectedDate().length > 0 ? (
            getFilteredEventsForSelectedDate().map((event) => (
              <Shadow key={event.id} distance={5} startColor={'rgba(0, 0, 0, 0.05)'} style={styles.shadowContainer}>
                <View style={[
                  styles.eventCard,
                  { backgroundColor: Colors[colorScheme ?? 'light'].cardBackground },
                  { borderLeftWidth: 4, ...getEventStyle(event) }
                ]}>
                  <View style={styles.eventHeader}>
                    <Text style={[styles.eventTitle, { color: 'white' }]}>
                      {event.title}
                    </Text>
                    <Text style={[styles.eventUser, { color: 'white' }]}>
                      {event.user === 'teacher' ? '👨‍🏫 Teacher' : '👩‍⚕️ Doctor'}
                    </Text>
                  </View>
                  
                  <View style={styles.eventDetails}>
                    <Text style={[styles.eventTime, { color: 'white' }]}>
                      {event.startTime} {event.endTime ? `- ${event.endTime}` : ''}
                    </Text>
                    {event.details && (
                      <Text style={[styles.eventDetail, { color: 'white' }]}>
                        {event.details}
                      </Text>
                    )}
                  </View>
                </View>
              </Shadow>
            ))
          ) : (
            <Text style={[styles.noEvents, { color: Colors[colorScheme ?? 'light'].textSecondary }]}>
              No events scheduled for this day
            </Text>
          )}
        </ScrollView>
      </View>
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
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
    minWidth: 80,
    alignItems: 'center',
  },
  calendarContainer: {
    paddingHorizontal: 10,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  legendGroup: {
    alignItems: 'flex-start',
  },
  legendTitle: {
    fontWeight: '600',
    marginBottom: 5,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    marginBottom: 5,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 5,
  },
  eventsContainer: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  dateTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  eventsList: {
    flex: 1,
  },
  shadowContainer: {
    width: '100%',
    marginBottom: 12,
    borderRadius: 12,
  },
  eventCard: {
    padding: 16,
    borderRadius: 12,
  },
  eventHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  eventTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  eventUser: {
    fontSize: 14,
  },
  eventDetails: {
    marginTop: 4,
  },
  eventTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  eventDetail: {
    fontSize: 14,
  },
  noEvents: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});
