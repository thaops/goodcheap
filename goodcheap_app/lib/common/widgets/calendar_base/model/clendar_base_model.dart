import 'package:flutter/material.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

class Meeting {
  Meeting(this.eventName, this.from, this.to, this.background, this.isAllDay);
  String eventName;
  DateTime from;
  DateTime to;
  Color background;
  bool isAllDay;
}

class MeetingDataSource extends CalendarDataSource {
  MeetingDataSource(List<Meeting> source) { appointments = source; }
  @override DateTime getStartTime(int index) => (appointments![index] as Meeting).from;
  @override DateTime getEndTime(int index) => (appointments![index] as Meeting).to;
  @override String getSubject(int index) => (appointments![index] as Meeting).eventName;
  @override Color getColor(int index) => (appointments![index] as Meeting).background;
  @override bool isAllDay(int index) => (appointments![index] as Meeting).isAllDay;
}

/// Helper: lấy events theo ngày (xem overlap)
List<Meeting> getAppointmentsForDay(List<Meeting> meetings, DateTime date) {
  final startOfDay = DateTime(date.year, date.month, date.day, 0, 0, 0);
  final endOfDay = DateTime(date.year, date.month, date.day, 23, 59, 59);
  final list = meetings.where((m) => m.from.isBefore(endOfDay) && m.to.isAfter(startOfDay)).toList();
  list.sort((a, b) => a.from.compareTo(b.from));
  return list;
}
