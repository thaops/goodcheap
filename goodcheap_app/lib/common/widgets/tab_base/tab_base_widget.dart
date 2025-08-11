import 'package:flutter/material.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_sizes.dart';
import 'package:goodcheap_app/common/widgets/custom_text_field.dart';

class TabBaseWidget extends StatefulWidget {
  final List<Tab> tabs;
  final List<Widget> children;
  final Widget? widgetHeader;
  final Widget? leading;
  final EdgeInsets? containerPadding;
  final EdgeInsetsGeometry? tabLabelPadding;
  final EdgeInsetsGeometry? tabIndicatorPadding;
  final double tabItemHorizontalPadding;
  const TabBaseWidget({
    Key? key,
    required this.tabs,
    required this.children,
    this.widgetHeader,
    this.leading,
    this.containerPadding,
    this.tabLabelPadding,
    this.tabIndicatorPadding,
    this.tabItemHorizontalPadding = 6,
  }) : super(key: key);

  @override
  State<TabBaseWidget> createState() => _TabBaseWidgetState();
}

class _TabBaseWidgetState extends State<TabBaseWidget> {
  @override
  Widget build(BuildContext context) {
    return  Scaffold(
        body: Column(
          children: [
            Container(
              color: AppColors.primary,
              padding: widget.containerPadding ?? EdgeInsets.only(
                top: AppSizes.paddingMedium,
                left: AppSizes.paddingMedium,
                right: AppSizes.paddingMedium,
                bottom: AppSizes.paddingXSmall,
              ),
              child: Column(
                children: [
                  Row(
                    children: [
                      widget.leading ?? SizedBox.shrink(),
                      Expanded(
                        child: Center(
                          child: TabBar(
                            isScrollable: true,
                            dividerColor: Colors.transparent,
                            labelColor: Colors.black,
                            unselectedLabelColor: Colors.white,
                            labelStyle: const TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 14,
                            ),
                            unselectedLabelStyle: const TextStyle(
                              fontWeight: FontWeight.w500,
                              fontSize: 14,
                            ),
                            labelPadding: widget.tabLabelPadding ?? const EdgeInsets.symmetric(
                              horizontal: 8,
                              vertical: 4,
                            ),
                            indicatorPadding: widget.tabIndicatorPadding ?? const EdgeInsets.symmetric(
                              horizontal: 2,
                              vertical: 2,
                            ),
                            overlayColor: MaterialStateProperty.all(
                              Colors.transparent,
                            ),
                            indicator: const BoxDecoration(
                              color: Colors.white,
                              borderRadius: BorderRadius.all(
                                Radius.circular(8),
                              ),
                            ),
                            indicatorColor: null,
                            tabs:
                                widget.tabs
                                    .map(
                                      (e) => Padding(
                                        padding: EdgeInsets.symmetric(
                                          horizontal: widget.tabItemHorizontalPadding,
                                        ),
                                        child: e,
                                      ),
                                    )
                                    .toList(),
                          ),
                        ),
                      ),
                    ],
                  ),
                 widget.widgetHeader ?? SizedBox.shrink(),
                ],
              ),
            ),
            Expanded(child: TabBarView(children: widget.children)),
          ],
        ),
      
    );
  }
}
