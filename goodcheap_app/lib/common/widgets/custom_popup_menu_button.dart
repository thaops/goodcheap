import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';

class CustomPopupMenuButton<T> extends StatelessWidget {
  final List<PopupMenuEntry<T>> items;
  final ValueChanged<T> onSelected;
  final Widget? icon;
  final Color? backgroundColor;
  final double? elevation;
  final EdgeInsets? padding;
  final BorderRadius? borderRadius;
  final Color? iconColor;
  final double? iconSize;
  final Duration animationDuration;
  final Curve animationCurve;
  final TextStyle? textStyle;
  final BoxDecoration? menuDecoration;
  final Offset? offset;
  final String? tooltip;

  const CustomPopupMenuButton({
    Key? key,
    required this.items,
    required this.onSelected,
    this.icon,
    this.backgroundColor,
    this.elevation,
    this.padding,
    this.borderRadius,
    this.iconColor,
    this.iconSize,
    this.animationDuration = const Duration(milliseconds: 200),
    this.animationCurve = Curves.easeInOut,
    this.textStyle,
    this.menuDecoration,
    this.offset,
    this.tooltip,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return PopupMenuButton<T>(
      onSelected: onSelected,
      itemBuilder: (BuildContext context) => items.map((item) {
        if (item is PopupMenuItem<T>) {
          return PopupMenuItem<T>(
            value: item.value,
            child: DefaultTextStyle(
              style: textStyle ??
                  TextStyle(
                    fontSize: 14.sp,
                    fontWeight: FontWeight.w500,
                    color: AppColors.black,
                  ),
              child: item.child ?? const SizedBox(),
            ),
          );
        }
        return item;
      }).toList(),
      // Chỉ sử dụng icon nếu không có menuDecoration
      icon: menuDecoration == null
          ? (icon ??
              Icon(
                Icons.more_vert,
                color: iconColor ?? AppColors.primary,
                size: iconSize ?? 24.sp,
              ))
          : null,
      // Chỉ sử dụng child nếu có menuDecoration
      child: menuDecoration != null
          ? Container(
              decoration: menuDecoration,
              padding: EdgeInsets.all(8.w), // Thêm padding để đẹp hơn
              child: Icon(
                Icons.more_vert,
                color: iconColor ?? AppColors.primary,
                size: iconSize ?? 24.sp,
              ),
            )
          : null,
      elevation: elevation ?? 8.0,
      padding: padding ?? EdgeInsets.all(8.w),
      offset: offset ?? Offset.zero,
      tooltip: tooltip,
      shape: RoundedRectangleBorder(
        borderRadius: borderRadius ?? BorderRadius.circular(8.r),
      ),
      popUpAnimationStyle: AnimationStyle(
        duration: animationDuration,
        curve: animationCurve,
      ),
      color: backgroundColor ?? AppColors.white,
    );
  }
}