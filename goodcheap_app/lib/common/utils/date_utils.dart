import 'package:intl/intl.dart';

class DateUtilsCustom {
  // Hàm định dạng ngày (dd/MM/yyyy)
  static String formatDate(DateTime? date) {
    if (date != null) {
      try {
        return DateFormat('dd/MM/yyyy').format(date);
      } catch (e) {
        print("Error formatting date: $e");
        return date.toString();
      }
    } else {
      return 'N/A';
    }
  }

  // Hàm chuyển đổi chuỗi ISO 8601 thành DateTime rồi định dạng ngày
  static String formatStringDate(String? date) {
    if (date != null && date.isNotEmpty) {
      try {
        DateTime dateTime = DateTime.parse(date);
        return formatDate(dateTime);
      } catch (e) {
        print("Error parsing date: $e");
        return date;
      }
    } else {
      return 'N/A';
    }
  }

  // Hàm định dạng giờ (ví dụ: HH:mm)
  static String formatTime(DateTime? time) {
    if (time != null) {
      try {
        return DateFormat('HH:mm').format(time);
        // Nếu muốn dùng định dạng 12 giờ, thay 'HH:mm' bằng 'hh:mm a'
      } catch (e) {
        print("Error formatting time: $e");
        return time.toString();
      }
    } else {
      return 'N/A';
    }
  }

  // Hàm chuyển chuỗi ISO 8601 thành DateTime rồi định dạng giờ
  static String formatStringTime(String? time) {
    if (time != null && time.isNotEmpty) {
      try {
        DateTime dateTime = DateTime.parse(time);
        return formatTime(dateTime);
      } catch (e) {
        print("Error parsing time: $e");
        return time;
      }
    } else {
      return 'N/A';
    }
  }
}
