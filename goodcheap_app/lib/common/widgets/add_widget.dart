import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
class AddWidget extends StatelessWidget {
  final dynamic arguments;
  final Function()? onPressed;
  final String routeName;
  final Color? color;
  final double? height;
  final double? width;

  const AddWidget({super.key, required this.arguments, this.onPressed, required this.routeName, this.color, this.height, this.width});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () async {
        final result = await Get.toNamed(
            routeName,
            arguments: arguments);
        if (result == true) {
          onPressed?.call();
        }
      },
      child: Container(
        height: height ?? 30.r,
        width: width ?? 30.r,
        decoration: BoxDecoration(
          color: color ?? AppColors.primary,
          borderRadius: BorderRadius.circular(20.r),
        ),
        child: Icon(Icons.add, color: AppColors.white),
      ),
    );
  }
}
