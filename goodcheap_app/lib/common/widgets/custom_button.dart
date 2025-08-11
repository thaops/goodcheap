import 'package:flutter/material.dart';
import 'package:goodcheap_app/common/widgets/text_widget.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CustomButton extends StatelessWidget {
  final String text;
  final Function()? onPressed;
  final Color? color;
  final Color? textColor;
  final bool isOutlined;
  final double? width;
  final double? height;
  final double? horizontalPadding;
  final double? verticalPadding;
  final int? fontSize;
  final double? borderRadius;
  
  
  const CustomButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.color,
    this.textColor,
    this.isOutlined = false,
    this.width,
    this.height,
    this.horizontalPadding,
    this.verticalPadding,
    this.fontSize,
    this.borderRadius,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        onPressed?.call();
      },
      child: Container(
        width: width,
        height: height,
        alignment: Alignment.center,
        padding: EdgeInsets.symmetric(
            horizontal: horizontalPadding ?? 25,
            vertical: verticalPadding ?? 10),
        decoration: BoxDecoration(
          color: isOutlined ? Colors.transparent : color,
          borderRadius: BorderRadius.circular(borderRadius ?? 4.r),
          border:
              Border.all(color: isOutlined ? Colors.black : AppColors.primary),
        ),
        child: TextWidget(
          text: text,
          fontSize: fontSize?.toDouble() ?? 16,
          fontWeight: FontWeight.w300,
          color: textColor ?? Colors.white,
        ),
      ),
    );
  }
}
