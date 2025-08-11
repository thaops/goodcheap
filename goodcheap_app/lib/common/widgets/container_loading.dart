import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';

class ContainerLoading extends StatelessWidget {
  final double? height;
  final double? width;
  const ContainerLoading({super.key , this.height = 84, this.width});

  @override
  Widget build(BuildContext context) {
    return Container(
              width: width?.w ?? double.infinity,
              height: height?.h,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                color: Colors.grey.shade400,
              ),
            );
  }
}