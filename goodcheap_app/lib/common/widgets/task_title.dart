import 'package:flutter/material.dart';
import 'package:goodcheap_app/common/widgets/custom_text_field.dart';
import 'package:goodcheap_app/common/widgets/text_widget.dart';
import 'package:goodcheap_app/common/design_system/tokens/app_colors.dart';
import 'package:flutter_screenutil/flutter_screenutil.dart';
import 'package:flutter/services.dart';

class TaskTitle extends StatefulWidget {
  final TextEditingController controllerNote;
  final String label;
  final String note;
  final double screenWidth;
  final bool? isNumber;
  final int? minLines;

  TaskTitle({
    required this.label,
    required this.note,
    required this.screenWidth,
    required this.controllerNote,
    this.isNumber = false,
    this.minLines = 1,
  });

  @override
  _TaskTitleState createState() => _TaskTitleState();
}

class _TaskTitleState extends State<TaskTitle> {
  @override
  void initState() {
    super.initState();
    _onTextChanged();
  }

  @override
  void dispose() {
    widget.controllerNote.removeListener(_onTextChanged);
    super.dispose();
  }

  void _onTextChanged() {
    if (widget.isNumber == true) {
      final text = widget.controllerNote.text;
      if (text.isNotEmpty) {
        final intValue = int.tryParse(text.replaceAll('.', ''));
        if (intValue != null) {
          final formattedText = _formatNumber(intValue.toString());
          if (formattedText != text) {
            widget.controllerNote.value = TextEditingValue(
              text: formattedText,
              selection: TextSelection.collapsed(offset: formattedText.length),
            );
          }
        }
      }
    }
  }

  String _formatNumber(String s) {
    return s.replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.');
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(bottom: 16.h),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          TextWidget(
            text: widget.label,
            fontSize: 14,
            fontWeight: FontWeight.w500,
            color: AppColors.black,
          ),
          8.verticalSpace,
          CustomTextField(
            controller: widget.controllerNote,
            hintText: widget.note,
          )
        ],
      ),
    );
  }
}

class ThousandsSeparatorInputFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
      TextEditingValue oldValue, TextEditingValue newValue) {
    final text = newValue.text.replaceAll('.', '');
    final newText = _formatNumber(text);
    print('New Text: $newText');
    return newValue.copyWith(
      text: newText,
      selection: TextSelection.collapsed(offset: newText.length),
    );
  }

  String _formatNumber(String s) {
    return s.replaceAllMapped(
        RegExp(r'(\d)(?=(\d{3})+(?!\d))'), (Match m) => '${m[1]}.');
  }
}
