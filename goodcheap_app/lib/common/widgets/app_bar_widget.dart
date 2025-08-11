import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:goodcheap_app/common/widgets/text_widget.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
import 'custom_popup_menu_button.dart'; // Import file chứa CustomPopupMenuButton

class AppBarWidget extends StatelessWidget implements PreferredSizeWidget {
  final String? title;
  final Widget? mainWidget;
  final double heightAppBar;
  final bool isBack;
  final Function? onWillPop;
  final Widget? leadingWidget;
  final IconData? iconRightFirst;
  final IconData? iconRightSecond;
  final Color? colorFirst;
  final Color? colorSecond;
  final double? sizeTitle;
  final bool isTitleCenter;
  final VoidCallback? onLeadingIconPressed;
  final VoidCallback? onPressedFirst;
  final VoidCallback? onPressedSecond;
  final String? image;
  final Widget? widgetRight;
  // Thêm thuộc tính cho CustomPopupMenuButton
  final List<PopupMenuEntry<String>>? popupMenuItems;
  final ValueChanged<String>? onPopupMenuSelected;
  final Color? backgroundColor;
  // NEW: widget nằm dưới title, giữ nền AppBar (dùng AppBar.bottom)
  final PreferredSizeWidget? bottom;

  const AppBarWidget({
    Key? key,
    this.title,
    this.mainWidget,
    this.heightAppBar = 45,
    this.isBack = true,
    this.onWillPop,
    this.leadingWidget,
    this.iconRightFirst,
    this.iconRightSecond,
    this.colorFirst,
    this.colorSecond,
    this.sizeTitle,
    this.isTitleCenter = true,
    this.onLeadingIconPressed,
    this.onPressedFirst,
    this.onPressedSecond,
    this.image,
    this.widgetRight,
    this.popupMenuItems,
    this.onPopupMenuSelected,
    this.backgroundColor,
    this.bottom,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return AppBar(
      automaticallyImplyLeading: false,
      backgroundColor: backgroundColor ?? AppColors.primary,
      leading: leadingWidget != null
          ? InkWell(
              onTap: onLeadingIconPressed,
              child: leadingWidget,
            )
          : isBack
              ? IconButton(
                  onPressed: () => onWillPop != null ? onWillPop!() : Navigator.pop(context),
                  icon: Icon(
                    Icons.arrow_back_ios_rounded,
                    color: AppColors.white,
                    size: 20.sp,
                  ),
                )
              : null,
      centerTitle: isTitleCenter,
      title: mainWidget ?? _buildTitle(),
      actions: _buildActions(),
      bottom: bottom, 
    );
  }

  Widget? _buildTitle() {
    if (title != null) {
      return TextWidget(
        text: title!,
        fontSize: sizeTitle ?? 16.sp,
        fontWeight: FontWeight.w500,
        color: AppColors.white,
      );
    } else if (image != null) {
      return Image.asset(
        image!,
        fit: BoxFit.cover,
        width: 100.w,
      );
    }
    return null;
  }

  List<Widget> _buildActions() {
    final actions = <Widget>[];

    // Thêm CustomPopupMenuButton nếu có popupMenuItems
    if (popupMenuItems != null && onPopupMenuSelected != null) {
      actions.add(
        CustomPopupMenuButton<String>(
          items: popupMenuItems!,
          onSelected: onPopupMenuSelected!,
          icon: Icon(
            Icons.more_horiz,
            color: AppColors.white,
            size: 24.sp,
          ),
          backgroundColor: AppColors.white,
          elevation: 8.0,
          borderRadius: BorderRadius.circular(8.r),
          padding: EdgeInsets.all(8.w),
          animationDuration: const Duration(milliseconds: 200),
          animationCurve: Curves.easeInOut,
          textStyle: TextStyle(
            fontSize: 14.sp,
            fontWeight: FontWeight.w500,
            color: AppColors.black,
          ),
          tooltip: 'Menu',
        ),
      );
    }

    if (widgetRight != null)
      actions.add(
        Container(
          constraints:
              BoxConstraints(maxWidth: 50, maxHeight: 50), // Ensure constraints
          child: widgetRight,
        ),
      );

    // Thêm các icon khác nếu có
    if (iconRightSecond != null) {
      actions.add(
        IconButton(
          onPressed: onPressedSecond,
          icon: Icon(
            iconRightSecond,
            color: colorSecond ?? AppColors.white,
            size: 24.sp,
          ),
        ),
      );
    }
    if (iconRightFirst != null) {
      actions.add(
        IconButton(
          onPressed: onPressedFirst,
          icon: Icon(
            iconRightFirst,
            color: colorFirst ?? AppColors.white,
            size: 24.sp,
          ),
        ),
      );
    }

    return actions;
  }

  @override
  Size get preferredSize => Size.fromHeight(
        heightAppBar.h + (bottom?.preferredSize.height ?? 0),
      );
}
