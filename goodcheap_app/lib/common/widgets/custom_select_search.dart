import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter_typeahead/flutter_typeahead.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_sizes.dart';

class Item {
  final String id;
  final String name;

  Item({required this.id, required this.name});
}

class CustomSelectSearch extends StatefulWidget {
  final String? label1;
  final String? name;
  final Color? colorIcon;
  final Color? textColor;
  final IconData? icon;
  final List<Item>? selectList;
  final bool isEnabled;
  final void Function(String?)? onProjectSelected;
  final bool isNotChange;
  final String? errorText;

  const CustomSelectSearch({
    Key? key,
    this.label1,
    this.name,
    this.selectList,
    this.textColor,
    this.colorIcon,
    this.onProjectSelected,
    this.icon,
    this.isEnabled = true,
    this.isNotChange = false,
    this.errorText,
  }) : super(key: key);

  @override
  State<CustomSelectSearch> createState() => _SelectState();
}

class _SelectState extends State<CustomSelectSearch> {
  final TextEditingController _controller = TextEditingController();
  final FocusNode _focusNode = FocusNode();
  String? _selectedId;

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;

    return Container(
      padding: EdgeInsets.only(bottom: 16.h),
      width: screenWidth,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          if (widget.label1 != null)
            Text(
              widget.label1 ?? '',
              style: TextStyle(
                fontSize: 14.sp,
                fontWeight: FontWeight.w500,
                color: widget.colorIcon ?? Colors.black,
                fontFamily: 'Inter',
              ),
            ),
          SizedBox(height: 8.h),
          TypeAheadField<String>(
            controller: _controller,
            focusNode: _focusNode,
            builder: (context, controller, focusNode) {
              return TextField(
                controller: controller,
                focusNode: focusNode,
                enabled: widget.isEnabled && !widget.isNotChange,
                decoration: InputDecoration(
                  hintText: widget.name ?? 'Chọn một tùy chọn',
                  hintStyle: TextStyle(
                    color: Colors.black.withOpacity(0.8),
                    fontWeight: FontWeight.w400,
                    fontSize: 14.sp,
                    fontFamily: 'Inter',
                  ),
                  contentPadding: EdgeInsets.symmetric(horizontal: 16.w, vertical: 8.h),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(
                      color: widget.errorText != null ? Colors.red : Colors.grey.shade400,
                    ),
                  ),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(
                      color: widget.errorText != null ? Colors.red : Colors.grey.shade400,
                    ),
                  ),
                  disabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12.r),
                    borderSide: BorderSide(color: Colors.grey.shade200),
                  ),
                  filled: true,
                  fillColor: widget.isEnabled ? Colors.white : Colors.grey.shade100,
                  suffixIcon: widget.isEnabled ? Icon(
                    widget.icon ?? Icons.keyboard_arrow_down_rounded,
                    color: widget.isEnabled ? widget.colorIcon ?? Colors.black : Colors.grey.shade400,
                    size: 20.sp,
                  ) : null,
                  // prefixIcon: Icon(Icons.search, size: 20.sp, color: Colors.grey),
                ),
                style: TextStyle(
                  color: Colors.black,
                  fontWeight: FontWeight.w400,
                  fontSize: 14.sp,
                  fontFamily: 'Inter',
                ),
              );
            },
            suggestionsCallback: (pattern) async {
              if (widget.selectList == null) return [];
              return widget.selectList!
                  .where((item) => item.name.toLowerCase().contains(pattern.toLowerCase()))
                  .map((item) => item.name)
                  .toList();
            },
            itemBuilder: (context, String suggestion) {
              return Container(
                decoration: BoxDecoration(
                  color: suggestion == _controller.text ? Colors.blue.shade50 : Colors.white,
                  border: Border(bottom: BorderSide(color: Colors.grey.shade200)),
                ),
                child: ListTile(
                  title: Text(
                    suggestion,
                    style: TextStyle(
                      color: Colors.black,
                      fontWeight: FontWeight.w400,
                      fontSize: 14.sp,
                      fontFamily: 'Inter',
                    ),
                  ),
                ),
              );
            },
            onSelected: (String suggestion) {
              if (widget.selectList != null) {
                final selectedItem = widget.selectList!.firstWhere(
                  (item) => item.name == suggestion,
                  orElse: () => Item(id: '', name: ''),
                );
                setState(() {
                  _selectedId = selectedItem.id;
                  _controller.text = selectedItem.name;
                });
                widget.onProjectSelected?.call(selectedItem.id);
              }
            },
            constraints: BoxConstraints(maxHeight: AppSizes.heightXXXXXXLarge),
            emptyBuilder: (context) => Padding(
              padding: EdgeInsets.symmetric(vertical: 12.h, horizontal: 16.w),
              child: Text(
                'Không tìm thấy',
                style: TextStyle(
                  color: Colors.grey.shade600,
                  fontSize: 14.sp,
                  fontFamily: 'Inter',
                ),
              ),
            ),
          ),
          if (widget.errorText != null) ...[
            SizedBox(height: 4.h),
            Text(
              widget.errorText!,
              style: TextStyle(
                fontSize: 12.sp,
                fontWeight: FontWeight.w400,
                color: Colors.red,
                fontFamily: 'Inter',
              ),
            ),
          ],
        ],
      ),
    );
  }
}