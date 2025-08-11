import 'package:flutter/material.dart';
import 'package:goodcheap_app/common/widgets/custom_button.dart';
import 'package:goodcheap_app/common/widgets/text_widget.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class CustomDialog {
  Future<bool?> showConfirmationDialog(BuildContext context, String title, String content,
      {dynamic data}) {
    return showDialog<bool>(
      context: context,
      barrierDismissible: false,
      builder: (BuildContext context) {
        return Dialog(
          child: Container(
            width: MediaQuery.of(context).size.width * 0.9,
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                SizedBox(height: 20.h),
                TextWidget(
                  text: title,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.black,
                ),
                SizedBox(height: 10.h),
                TextWidget(
                  text: content,
                  fontSize: 14,
                  fontWeight: FontWeight.normal,
                  color: AppColors.grey,
                ),
                SizedBox(height: 30.h),
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        text: 'Hủy',
                        color: AppColors.primary,
                        textColor: AppColors.black,
                        onPressed: () {
                          Navigator.of(context).pop(false);
                        },
                        isOutlined: true,
                      ),
                    ),
                    SizedBox(width: 10.w),
                    Expanded(
                      child: CustomButton(
                        text: 'Có',
                        color: AppColors.primary,
                        textColor: AppColors.white,
                        onPressed: (data == null || (data != null && data.isNotEmpty))
                            ? () {
                                Navigator.of(context).pop(true);
                              }
                            : () {
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(
                                    content: Text("Vui lòng đợi 3 giây rồi thử lại"),
                                  ),
                                );
                              },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}