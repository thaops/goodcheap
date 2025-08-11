import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_sizes.dart';
import 'package:shimmer/shimmer.dart';

enum LoadingShimmerType {
  list,
  widget,
}

class LoadingShimmer extends StatelessWidget {
  final Widget child;
  final LoadingShimmerType type;
  final double? padding;

  const LoadingShimmer({super.key, required this.child, this.type = LoadingShimmerType.widget, this.padding});

  @override
  Widget build(BuildContext context) {
    var shimmer = Shimmer.fromColors(
        baseColor: Colors.grey.shade200,
        highlightColor: Colors.white,
        child: child,
    );
    return type == LoadingShimmerType.list ? ListView.builder(
      itemCount: 10,
      itemBuilder: (context, index) {
        return Padding(
          padding: EdgeInsets.symmetric(vertical: AppSizes.paddingMedium.h),
          child: shimmer,
        );
      },
    ) : shimmer;
  }
}


