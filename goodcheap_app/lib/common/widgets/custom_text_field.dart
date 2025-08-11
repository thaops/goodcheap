import 'package:flutter/material.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';

class CustomTextField extends StatelessWidget {
  final TextEditingController controller;
  final String hintText;
  final Function()? onTap;
  final bool obscureText;
  final IconData? suffixIcon;
  final Function()? onSubmit;
  final ValueChanged<String>? onChanged;
  final FocusNode? focusNode;
  final double? width;
  final bool isMobile;
  final IconData? prefixIcon;
  final double? borderWidth;
  final Color? backgroundColor;
  final double? borderRadius;
  final Color? borderColor;
  final double? fontSize;
  final int? maxLength;
  final int? maxLines;
  final int? minLines;
  final double? paddingVertical;
  final double? paddingHorizontal;
  final Color? colorIconSuffix;
  final Color? colorIconPrefix;
  final Function()? onSuffixTap;
  final bool? isNumberic;
  final Function()? onPrefixTap;
  final TextInputType? keyboardType;
  final String? errorText;
  final TextInputAction? textInputAction;
  final bool autofocus;
  final Color? hintColor;

  const CustomTextField({
    super.key,
    required this.controller,
    required this.hintText,
    this.obscureText = false,
    this.suffixIcon,
    this.onTap,
    this.onSubmit,
    this.onChanged,
    this.focusNode,
    this.width,
    this.isMobile = false,
    this.prefixIcon,
    this.colorIconPrefix,
    this.borderWidth,
    this.backgroundColor,
    this.borderRadius = 4,
    this.borderColor = AppColors.primaryV2,
    this.fontSize,
    this.maxLength,
    this.maxLines = 1,
    this.minLines = 1,
    this.paddingVertical,
    this.paddingHorizontal,
    this.colorIconSuffix,
    this.onSuffixTap,
    this.isNumberic = false,
    this.onPrefixTap,
    this.keyboardType,
    this.errorText,
    this.textInputAction,
    this.autofocus = false,
    this.hintColor,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.symmetric(
        horizontal: paddingHorizontal ?? 0,
        vertical: paddingVertical ?? 0,
      ),
      child: TextField(
        key: key,
        controller: controller,
        focusNode: focusNode,
        autofocus: autofocus,
        maxLength: maxLength,
        minLines: minLines,
        maxLines: maxLines,
        obscureText: obscureText,
        keyboardType: keyboardType ??
            (isNumberic == true ? TextInputType.number : TextInputType.text),
        textInputAction: textInputAction ?? TextInputAction.next,
        style: TextStyle(
          fontSize: fontSize ?? 16,
          fontWeight: FontWeight.w400,
          color: AppColors.black,
        ),
        decoration: InputDecoration(
          contentPadding: EdgeInsets.symmetric(
            horizontal: isMobile ? 12 : 24,
            vertical: isMobile ? 12 : 12,
          ),
          hintText: hintText,
          errorText: errorText,
          hintStyle: TextStyle(
            fontSize: fontSize ?? 16,
            fontWeight: FontWeight.w500,
            color: hintColor ?? Colors.grey.shade600,
          ),
          filled: backgroundColor != null,
          fillColor: backgroundColor ?? Colors.transparent,
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(borderRadius ?? 12),
            borderSide: BorderSide(
              color: borderColor ?? AppColors.primaryV2,
              width: borderWidth ?? 1,
            ),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(borderRadius ?? 12),
            borderSide: BorderSide(
              color: borderColor ?? AppColors.primaryV2,
              width: borderWidth ?? 1,
            ),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(borderRadius ?? 12),
            borderSide: BorderSide(
              color: Colors.red,
              width: borderWidth ?? 1,
            ),
          ),
          focusedErrorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(borderRadius ?? 12),
            borderSide: BorderSide(
              color: Colors.red,
              width: borderWidth ?? 1,
            ),
          ),
          prefixIcon: prefixIcon != null
              ? IconButton(
                  onPressed: onPrefixTap,
                  icon: Icon(prefixIcon, size: 24,color: colorIconPrefix),
                )
              : null,
          suffixIcon: suffixIcon != null
              ? IconButton(
                  icon: Icon(suffixIcon, size: 24),
                  color: colorIconSuffix ?? AppColors.colorIcon,
                  onPressed: onSuffixTap,
                )
              : null,
        ),
        onTap: onTap,
        onChanged: onChanged,
        onSubmitted: (value) {
          onSubmit?.call();
          // if (textInputAction == TextInputAction.done) {
          //   focusNode?.unfocus();
          // }
        },
      ),
    );
  }
}
