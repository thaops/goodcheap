import 'package:another_flushbar/flushbar.dart';
import 'package:flutter/material.dart';

class CustomFlushbar {
  /// Hiển thị Flushbar với cấu hình tùy chỉnh
  static Future<void> show({
    required BuildContext context,
    String title = 'Thông báo',
    required String message,
    Duration duration = const Duration(seconds: 3),
    FlushbarPosition flushbarPosition = FlushbarPosition.TOP,
    Color backgroundColor = Colors.blue,
  }) async {
    await Flushbar(
      title: title,
      message: message,
      duration: duration,
      margin: const EdgeInsets.all(8),
      borderRadius: BorderRadius.circular(8),
      flushbarPosition: flushbarPosition,
      backgroundColor: backgroundColor,
    ).show(context);
  }

  /// Hiển thị thông báo thành công với màu nền xanh
  static Future<void> showSuccess(
    BuildContext context, {
    String title = 'Thông báo',
    String message = 'Thành công',
    Duration duration = const Duration(seconds: 3),
  }) async {
    return show(
      context: context,
      title: title,
      message: message,
      duration: duration,
      backgroundColor: const Color.fromARGB(255, 37, 89, 39),
    );
  }

  /// Hiển thị thông báo lỗi với màu nền đỏ
  static Future<void> showError(
    BuildContext context, {
    String title = 'Thông báo',
    String message = 'Có lỗi xảy ra',
    Duration duration = const Duration(seconds: 3),
  }) async {
    return show(
      context: context,
      title: title,
      message: message,
      duration: duration,
      backgroundColor: const Color.fromARGB(255, 91, 32, 28),
    );
  }

  /// Hiển thị thông báo cảnh báo với màu nền vàng
  static Future<void> showWarning(
    BuildContext context, {
    String title = 'Thông báo',
    String message = 'Có lỗi xảy ra',
    Duration duration = const Duration(seconds: 3),
  }) async {
    return show(
      context: context,
      title: title,
      message: message,
      duration: duration,
      backgroundColor: const Color.fromARGB(255, 129, 121, 46),
    );
  }
}
