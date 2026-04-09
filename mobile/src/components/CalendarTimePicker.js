import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, Modal, StyleSheet, ScrollView,
} from 'react-native';

const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];
const DAYS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

export default function CalendarTimePicker({ visible, onClose, onConfirm, theme, accentColor = '#3ecfbe' }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(null);
  const [hour, setHour] = useState(10);
  const [minute, setMinute] = useState(0);

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDay = new Date(viewYear, viewMonth, 1).getDay();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  const goToPrev = () => {
    if (viewMonth === 0) { setViewYear(y => y - 1); setViewMonth(11); }
    else setViewMonth(m => m - 1);
  };
  const goToNext = () => {
    if (viewMonth === 11) { setViewYear(y => y + 1); setViewMonth(0); }
    else setViewMonth(m => m + 1);
  };

  const isSel = (d) => selectedDate &&
    selectedDate.getDate() === d &&
    selectedDate.getMonth() === viewMonth &&
    selectedDate.getFullYear() === viewYear;

  const isToday = (d) => d &&
    today.getDate() === d &&
    today.getMonth() === viewMonth &&
    today.getFullYear() === viewYear;

  const handleConfirm = () => {
    if (!selectedDate) return;
    const result = new Date(selectedDate);
    result.setHours(hour, minute, 0, 0);
    onConfirm(result);
    onClose();
  };

  const pad = (n) => String(n).padStart(2, '0');

  const s = styles(theme, accentColor);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={s.overlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={s.sheet}>

          {/* Month navigation */}
          <View style={s.calHeader}>
            <TouchableOpacity onPress={goToPrev} style={s.navBtn}>
              <Text style={s.navText}>‹</Text>
            </TouchableOpacity>
            <Text style={s.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
            <TouchableOpacity onPress={goToNext} style={s.navBtn}>
              <Text style={s.navText}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Day headers */}
          <View style={s.row}>
            {DAYS.map(d => (
              <Text key={d} style={s.dayHeader}>{d}</Text>
            ))}
          </View>

          {/* Calendar grid */}
          {rows.map((row, ri) => (
            <View key={ri} style={s.row}>
              {row.map((d, di) => {
                const selected = isSel(d);
                const tod = isToday(d);
                return (
                  <TouchableOpacity
                    key={di}
                    style={[
                      s.dayCell,
                      selected && { backgroundColor: accentColor, borderRadius: 999 },
                      tod && !selected && { borderWidth: 1, borderColor: accentColor, borderRadius: 999 },
                    ]}
                    onPress={() => d && setSelectedDate(new Date(viewYear, viewMonth, d))}
                    disabled={!d}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      s.dayText,
                      selected && { color: '#fff', fontWeight: '800' },
                      tod && !selected && { color: accentColor, fontWeight: '700' },
                      !d && { color: 'transparent' },
                    ]}>
                      {d || '·'}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}

          {/* Divider */}
          <View style={s.divider} />

          {/* Time Picker */}
          <Text style={s.timeLabel}>Set Time</Text>
          <View style={s.timePicker}>
            {/* Hours */}
            <View style={s.timeUnit}>
              <TouchableOpacity style={s.timeBtn} onPress={() => setHour(h => (h + 1) % 24)}>
                <Text style={s.timeBtnText}>▲</Text>
              </TouchableOpacity>
              <View style={[s.timeDisplay, { borderColor: accentColor }]}>
                <Text style={[s.timeValue, { color: accentColor }]}>{pad(hour)}</Text>
              </View>
              <TouchableOpacity style={s.timeBtn} onPress={() => setHour(h => (h - 1 + 24) % 24)}>
                <Text style={s.timeBtnText}>▼</Text>
              </TouchableOpacity>
              <Text style={s.unitLabel}>HH</Text>
            </View>

            <Text style={[s.timeSep, { color: accentColor }]}>:</Text>

            {/* Minutes */}
            <View style={s.timeUnit}>
              <TouchableOpacity style={s.timeBtn} onPress={() => setMinute(m => (m + 15) % 60)}>
                <Text style={s.timeBtnText}>▲</Text>
              </TouchableOpacity>
              <View style={[s.timeDisplay, { borderColor: accentColor }]}>
                <Text style={[s.timeValue, { color: accentColor }]}>{pad(minute)}</Text>
              </View>
              <TouchableOpacity style={s.timeBtn} onPress={() => setMinute(m => (m - 15 + 60) % 60)}>
                <Text style={s.timeBtnText}>▼</Text>
              </TouchableOpacity>
              <Text style={s.unitLabel}>MM</Text>
            </View>

            {/* AM/PM display */}
            <View style={s.ampmWrap}>
              <Text style={[s.ampm, { color: accentColor }]}>{hour < 12 ? 'AM' : 'PM'}</Text>
              <Text style={s.ampmSub}>{hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}:{pad(minute)}</Text>
            </View>
          </View>

          {/* Selected date display */}
          {selectedDate && (
            <View style={[s.selectedDisplay, { borderColor: accentColor + '55', backgroundColor: accentColor + '12' }]}>
              <Text style={[s.selectedText, { color: accentColor }]}>
                {selectedDate.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' })}
                {'  ·  '}
                {hour === 0 ? '12' : hour > 12 ? hour - 12 : hour}:{pad(minute)} {hour < 12 ? 'AM' : 'PM'}
              </Text>
            </View>
          )}

          {/* Confirm button */}
          <TouchableOpacity
            style={[s.confirmBtn, { backgroundColor: accentColor }, !selectedDate && { opacity: 0.4 }]}
            onPress={handleConfirm}
            disabled={!selectedDate}
          >
            <Text style={s.confirmText}>Confirm Date & Time</Text>
          </TouchableOpacity>

        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = (theme, accent) => StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  sheet: {
    backgroundColor: theme.card, borderRadius: 24,
    padding: 20, width: '100%', maxWidth: 360,
  },
  calHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14,
  },
  navBtn: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  navText: { fontSize: 24, color: theme.textPrimary, fontWeight: '700' },
  monthLabel: { fontSize: 16, fontWeight: '800', color: theme.textPrimary },
  row: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 4 },
  dayHeader: { width: 36, textAlign: 'center', fontSize: 11, fontWeight: '700', color: theme.textMuted },
  dayCell: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  dayText: { fontSize: 13, color: theme.textPrimary },
  divider: { height: 1, backgroundColor: theme.border, marginVertical: 16 },
  timeLabel: { fontSize: 13, fontWeight: '800', color: theme.textMuted, marginBottom: 12, textAlign: 'center' },
  timePicker: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 16 },
  timeUnit: { alignItems: 'center', gap: 6 },
  timeBtn: { padding: 6 },
  timeBtnText: { fontSize: 14, color: theme.textMuted, fontWeight: '700' },
  timeDisplay: {
    width: 56, height: 44, borderRadius: 12, borderWidth: 2,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: theme.elevated,
  },
  timeValue: { fontSize: 22, fontWeight: '900' },
  unitLabel: { fontSize: 10, color: theme.textMuted, fontWeight: '600' },
  timeSep: { fontSize: 28, fontWeight: '900', marginBottom: 20 },
  ampmWrap: { alignItems: 'center', gap: 4, marginLeft: 8 },
  ampm: { fontSize: 18, fontWeight: '900' },
  ampmSub: { fontSize: 11, color: theme.textMuted, fontWeight: '600' },
  selectedDisplay: {
    borderRadius: 10, borderWidth: 1, padding: 10,
    alignItems: 'center', marginBottom: 14,
  },
  selectedText: { fontSize: 13, fontWeight: '700' },
  confirmBtn: {
    borderRadius: 14, paddingVertical: 13, alignItems: 'center',
  },
  confirmText: { color: '#fff', fontSize: 15, fontWeight: '800' },
});
