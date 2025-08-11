import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';

class TextWidget extends StatelessWidget {
  final String text;
  final double fontSize;
  final FontWeight? fontWeight;
  final Color? color;
  final TextAlign? textAlign;
  final double? paddingHorizontal;
  final double? paddingVertical;
  final int? maxLines;
  const TextWidget(
      {super.key,
      required this.text,
      this.fontSize = 16,
      this.fontWeight = FontWeight.w400,
      this.color = AppColors.black,
      this.textAlign = TextAlign.left,
      this.paddingHorizontal = 0,
      this.paddingVertical = 0,
      this.maxLines = 1});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: paddingHorizontal!, vertical: paddingVertical!),
      child: Text(
        text,
        textAlign: textAlign,
        maxLines: maxLines,
        style: TextStyle(
        fontSize: fontSize.sp,
        fontWeight: fontWeight,
        color: color,
        overflow: TextOverflow.ellipsis,
        ),
      ),
    );
  }
}
