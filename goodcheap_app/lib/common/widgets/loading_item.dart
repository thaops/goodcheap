import 'package:flutter/material.dart';
import 'package:get/get.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';

class LoadingItem extends StatelessWidget {
  final double width;
  final double height;
  final double paddingBottom;
  final double borderRadius;
  const LoadingItem(
      {super.key,
      this.width = 0.9,
      this.height = 100,
      this.paddingBottom = 20,
      this.borderRadius = 12});

  @override
  Widget build(BuildContext context) {
    return Align(
      alignment: Alignment.center,
      child: Padding(
        padding: EdgeInsets.only(bottom: paddingBottom),
        child: Container(
          decoration: BoxDecoration(
            color: AppColors.backgroundError,
            borderRadius: BorderRadius.circular(borderRadius),
          ),
          width: Get.width * width,
          height: height,
          child: Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
