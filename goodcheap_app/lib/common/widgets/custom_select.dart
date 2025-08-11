import 'package:flutter/material.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:goodcheap_app/common/widgets/text_widget.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';

class Item {
  final String id;
  final String name;

  Item({required this.id, required this.name});
}

class CustomSelect extends StatefulWidget {
  final String label1;
  final String? name;
  final List<Item>? selectList;
  final void Function(String?)? onProjectSelected;

  CustomSelect({
    Key? key,
    required this.label1,
    this.name,
    this.selectList,
    this.onProjectSelected,
  }) : super(key: key);

  @override
  State<CustomSelect> createState() => _CustomSelectState();
}

class _CustomSelectState extends State<CustomSelect> {
  String? _selectedUser;

  @override
  Widget build(BuildContext context) {
    final screenWidth = MediaQuery.of(context).size.width;
    return Container(
      padding: EdgeInsets.only(bottom: 16.h),
      width: screenWidth,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextWidget(
            text: widget.label1,
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.black,
          ),
          8.verticalSpace,
          Container(
            width: screenWidth,
            height: 48.h,
            decoration: BoxDecoration(
              color: Colors.transparent,
              borderRadius: BorderRadius.circular(12),
            ),
            child: DropdownButtonFormField<String>(
              decoration: InputDecoration(
                contentPadding:
                    EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade400),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.blue),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(color: Colors.grey.shade400),
                ),
              ),
              isExpanded: true,
              value: _selectedUser,
              hint: Text(widget.name ?? 'Đang thực hiện'),
              onChanged: (String? newValue) {
                setState(() {
                  _selectedUser = newValue;
                  if (widget.onProjectSelected != null) {
                    widget.onProjectSelected!(newValue);
                  }
                });
              },
              items: widget.selectList?.map((Item item) {
                    return DropdownMenuItem<String>(
                      value: item.id,
                      child: Text(
                        item.name,
                        style: TextStyle(color: Colors.black87),
                      ),
                    );
                  }).toList() ??
                  [],
            ),
          ),
        ],
      ),
    );
  }
}
