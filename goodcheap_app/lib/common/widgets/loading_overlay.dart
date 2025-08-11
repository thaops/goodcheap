import 'package:flutter/material.dart';
import 'package:lottie/lottie.dart';
import 'package:goodcheap_app/common/img/img.dart';

class LoadingOverlay extends StatelessWidget {
  final bool isLoading;
  final Widget child;
  final bool? istwoloading;

  const LoadingOverlay({
    Key? key,
    required this.isLoading,
    required this.child,
    this.istwoloading,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final screenHeight = MediaQuery.of(context).size.height;
    final screenWidth = MediaQuery.of(context).size.width;

    return Stack(
      children: [
        child,
        if (isLoading)
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(0.01),
              child: Center(
                child: Container(
                  height: screenHeight * 0.15,
                  width: screenWidth * 0.3,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(20),
                    color: Colors.white.withOpacity(0.8),
                  ),
                  child: Center(
                    child: Lottie.network(
                      Img.loading,
                      width: screenWidth * 0.4,
                    ),
                  ),
                ),
              ),
            ),
          ),
        if (istwoloading == true)
          Positioned.fill(
            child: Container(
              color: Colors.black.withOpacity(0.01),
            ),
          ),
      ],
    );
  }
}
