import 'package:intl/intl.dart';

class CurrencyUtils {
  static String formatCurrency(double value) {
    try {
      return NumberFormat("#,##0", "vi_VN").format(value);
    } catch (e) {
      print("Error formatting currency: $e");
      return "Invalid number";
    }
  }
}
