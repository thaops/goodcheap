import 'dart:io';
import 'package:get/get.dart';

import 'package:dio/dio.dart' as dio;
import 'package:goodcheap_app/common/constants/http_status_codes.dart';
import 'package:goodcheap_app/common/repositoty/dio_api.dart';

class UploadImage {
  DioApi dioApi = DioApi();

  /// API thuần (không phụ thuộc GetX), trả về danh sách URL ảnh đã upload.
  /// Giữ nguyên logic chuẩn hoá tên file (.jpg) và gửi multipart.
  Future<List<String>> uploadImageResult(
    List<File> selectedImages,
    String uploadImageUrl, {
    DioApi? api,
  }) async {
    final client = api ?? dioApi;
    dio.FormData formData = dio.FormData.fromMap({});
    for (var image in selectedImages) {
      String fileName = image.path.split('/').last;
      if (!fileName.endsWith('.jpg')) {
        fileName = '${fileName.split('.').first}.jpg';
      }
      formData.files.add(
        MapEntry(
          'file',
          await dio.MultipartFile.fromFile(
            image.path,
            filename: fileName,
          ),
        ),
      );
    }

    final response = await client.post(
      uploadImageUrl,
      data: formData,
      isMultipart: true,
    );

    if (response.statusCode == HttpStatusCodes.STATUS_CODE_OK) {
      final data = response.data;
      return List<String>.from((data['data'] as List));
    }
    throw Exception('Upload failed: ${response.statusCode}');
  }

  Future<void> uploadImage(
    List<File> selectedImages,
    RxList<String> uploadImageList,
    RxBool isLoading,
    String uploadImageUrl) async {
    try {
      isLoading.value = true;
      final urls = await uploadImageResult(selectedImages, uploadImageUrl);
      if (uploadImageList.isNotEmpty) uploadImageList.clear();
      uploadImageList.addAll(urls);
    } catch (e) {
      print(e);
    } finally {
      isLoading.value = false;
    }
  }
}
