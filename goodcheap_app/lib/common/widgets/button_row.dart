import 'package:flutter/material.dart';
import 'package:goodcheap_app/common/widgets/custom_button.dart';
import 'package:get/get.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ButtonRow extends StatelessWidget {
  final Function()? onPressedSave;

  const ButtonRow({super.key, this.onPressedSave});

  @override
  Widget build(BuildContext context) {
    return Row(
      // Sử dụng Row để chứa các nút
      children: [
        Expanded(
          child: CustomButton(
            text: 'Hủy',
            color: AppColors.primary,
            textColor: AppColors.black,
            onPressed: () {
              Get.back(result: false);
            },
            isOutlined: true,
          ),
        ),
        20.horizontalSpace, // Khoảng cách giữa hai nút
        Expanded(
          child: CustomButton(
            text: 'Lưu',
            color: AppColors.primary,
            textColor: AppColors.white,
            onPressed: () {
              onPressedSave?.call();
            },
          ),
        ),
      ],
    );
  }
}
