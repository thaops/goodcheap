import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:goodcheap_app/common/img/img.dart';
import 'package:goodcheap_app/common/widgets/text_widget.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
import 'package:lottie/lottie.dart';

class StateErr extends StatelessWidget {
  final String? error;
  const StateErr({super.key, this.error});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          Lottie.asset(Img.err, height: 150.h, width: 150.h),
          TextWidget(
              text: error ?? 'Dữ Liệu Rỗng',
              fontSize: 14,
              fontWeight: FontWeight.w400,
              color: AppColors.black.withOpacity(0.5)),
        ],
      ),
    );
  }
}
