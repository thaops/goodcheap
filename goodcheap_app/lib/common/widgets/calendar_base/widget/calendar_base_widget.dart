import 'package:flutter/material.dart';
import 'package:goodcheap_app/common/widgets/calendar_base/model/clendar_base_model.dart';
import 'package:syncfusion_flutter_calendar/calendar.dart';

typedef BottomPanelBuilder = Widget Function(BuildContext context, DateTime selectedDate, List<Meeting> dayAppointments);

class CalendarBaseWidget extends StatefulWidget {
  final CalendarView view;
  final List<Meeting> meetings;
  final BottomPanelBuilder? bottomPanelBuilder; // optional: để month show danh sách
  final MonthViewSettings monthViewSettings;
  final ScheduleViewSettings scheduleViewSettings;
  final CalendarHeaderStyle? headerStyle;
  final CalendarController? controller;
  final void Function(DateTime)? onDateSelected;

  const CalendarBaseWidget({
    Key? key,
    required this.view,
    required this.meetings,
    this.bottomPanelBuilder,
    required this.monthViewSettings,
    required this.scheduleViewSettings,
    this.controller,
    this.onDateSelected,
    this.headerStyle,
  }) : super(key: key);

  @override
  State<CalendarBaseWidget> createState() => _CalendarBaseWidgetState();
}

class _CalendarBaseWidgetState extends State<CalendarBaseWidget> {
  late final CalendarController _controller;
  DateTime _selectedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    _controller = widget.controller ?? CalendarController();
    _controller.selectedDate = _selectedDate;
  }

  @override
  void dispose() {
    // nếu controller truyền vào từ ngoài, đừng dispose để tránh lỗi.
    if (widget.controller == null) {
      _controller.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final dayAppointments = getAppointmentsForDay(widget.meetings, _selectedDate);

    return Column(
      children: [
        Expanded(
          child: SfCalendar(
            controller: _controller,
            view: widget.view,
            headerHeight: 0,
            dataSource: MeetingDataSource(widget.meetings),
            monthViewSettings: widget.monthViewSettings,
            headerStyle: widget.headerStyle ?? const CalendarHeaderStyle(),
            scheduleViewSettings: widget.scheduleViewSettings,
            onTap: (details) {
              if (details.date != null) {
                final d = DateTime(details.date!.year, details.date!.month, details.date!.day);
                setState(() {
                  _selectedDate = d;
                  _controller.selectedDate = d;
                });
                widget.onDateSelected?.call(d);
              }
            },
          ),
        ),

        if (widget.bottomPanelBuilder != null && widget.view == CalendarView.month)
          widget.bottomPanelBuilder!(context, _selectedDate, dayAppointments),
      ],
    );
  }
}
