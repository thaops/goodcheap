import 'package:flutter/material.dart';

class ResponsiveHelper {
  // Phương thức lấy chiều rộng màn hình
  static double screenWidth(BuildContext context) {
    return MediaQuery.of(context).size.width;
  }

  // Phương thức lấy chiều cao màn hình
  static double screenHeight(BuildContext context) {
    return MediaQuery.of(context).size.height;
  }

  static bool isTablet(BuildContext context) {
    return screenWidth(context) > 600 && screenWidth(context) <= 1200;
  }

  // Kiểm tra nếu là mobile
  static bool isMobile(BuildContext context) {
    return screenWidth(context) <= 600;
  }

  static bool isWeb(BuildContext context) {
    return screenWidth(context) > 1200;
  }
}
