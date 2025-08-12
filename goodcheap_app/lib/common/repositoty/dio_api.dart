import 'package:dio/dio.dart';
import 'package:dio/io.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';
import 'package:goodcheap_app/common/Services/config.dart';
import 'package:goodcheap_app/common/Services/services.dart';
import 'package:goodcheap_app/common/constants/http_status_codes.dart';
import 'package:goodcheap_app/common/repositoty/device_service.dart';
import 'package:goodcheap_app/common/repositoty/device_udid.dart';

part 'dio_api.g.dart';

/// Cung cấp instance DioApi cho các yêu cầu HTTP
@riverpod
DioApi dioApi(Ref  ref) {
  final dioApi = DioApi();
  // Đảm bảo DioApi được dispose khi provider bị hủy
  // ref.onDispose(() {
  //   dioApi.dio.close();
  // });
  return dioApi;
}

/// Lớp quản lý các yêu cầu HTTP với Dio
class DioApi {
  final Dio dio;
  final DeviceService deviceService = DeviceService();

  DioApi() : dio = Dio() {
    dio.options.baseUrl = Config.baseUrl;
    dio.options.validateStatus = (status) => status != null && status < 500;
    (dio.httpClientAdapter as IOHttpClientAdapter).onHttpClientCreate = (client) {
      client.badCertificateCallback = (cert, host, port) => true;
      return client;
    };
  }

  /// Lấy headers chung cho tất cả request
  Future<Map<String, String>> _getHeaders({bool isMultipart = false}) async {
    final services = await Services.create();
    final deviceUdid = await DeviceUdid.createDeviceUdid();
    final accessToken = await services.getAccessToken();
    final deviceInfo = await deviceService.getDeviceInfo();
    print('accessToken: $accessToken');
    return {
      'accept': '*/*',
      'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json',
      'Authorization': 'Bearer $accessToken',
      'X_API_ID': 'VN_CREW_2017',
      'X_API_KEY': 'KE4Sc6zqaaHHlpkzStfdpwcmnkvposK6',
      'X_REQUEST_API_VERSION': '5.0',
      'X_REQUEST_UDID': deviceInfo.udid,
      'X_REQUEST_PLATFORM': deviceInfo.platform,
      'X_REQUEST_DEVICE_NAME': deviceInfo.deviceName,
      'X_REQUEST_DEVICE_TYPE': deviceInfo.deviceType,
      'X_REQUEST_OS_VERSION': deviceInfo.osVersion,
      'X_APP_ID': deviceInfo.appId,
      'X_APP_BUILD': deviceInfo.appBuild,
      'X_APP_VERSION': deviceInfo.appVersion,
      'X_PUSH_TOKEN': deviceInfo.pushToken,
      'X_DEVICE_UDID': await deviceUdid.getUdid(),
    };
  }

  /// Gửi yêu cầu GET
  Future<Response> get(
    String url, {
    Map<String, dynamic>? params,
    dynamic data,
    CancelToken? cancelToken,
    Options? options,
  }) async {
    try {
      final headers = await _getHeaders();
      final mergedOptions = options?.copyWith(
            headers: {...?options.headers, ...headers},
          ) ??
          Options(headers: headers);
      final response = await dio.get(
        url,
        queryParameters: params,
        data: data,
        options: mergedOptions,
        cancelToken: cancelToken,
      );
      return _handleResponse(response);
    } on DioException catch (e) {
      print("errors: $e");
      throw Exception('Failed to load data: ${e.message}');
    } catch (e) {
      print("errorsc: $e");
      throw Exception('Unexpected error: $e');
    }
  }

  /// Gửi yêu cầu POST
  Future<Response> post(
    String url, {
    dynamic data,
    Options? options,
    bool isMultipart = false,
  }) async {
    try {
      final headers = await _getHeaders(isMultipart: isMultipart);
      final mergedOptions = options?.copyWith(
            headers: {...?options.headers, ...headers},
          ) ??
          Options(headers: headers);
      final response = await dio.post(
        url,
        data: data,
        options: mergedOptions,
      );
      return _handleResponse(response);
    } on DioException catch (e) {
      print("errors: $e");
      throw Exception('Failed to post data: ${e.message}');
    } catch (e) {
      print("errorsc: $e");
      throw Exception('Unexpected error: $e');
    }
  }

  /// Gửi yêu cầu PUT
  Future<Response> put(
    String url, {
    Map<String, dynamic>? data,
    Options? options,
  }) async {
    try {
      final headers = await _getHeaders();
      final mergedOptions = options?.copyWith(
            headers: {...?options.headers, ...headers},
          ) ??
          Options(headers: headers);
      final response = await dio.put(
        url,
        data: data,
        options: mergedOptions,
      );
      return _handleResponse(response);
    } on DioException catch (e) {
      throw Exception('Failed to update data: ${e.message}');
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  /// Gửi yêu cầu DELETE
  Future<Response> delete(
    String url, {
    Map<String, dynamic>? params,
    Options? options,
  }) async {
    try {
      final headers = await _getHeaders();
      final mergedOptions = options?.copyWith(
            headers: {...?options.headers, ...headers},
          ) ??
          Options(headers: headers);
      final response = await dio.delete(
        url,
        queryParameters: params,
        options: mergedOptions,
      );
      return _handleResponse(response);
    } on DioException catch (e) {
      throw Exception('Failed to delete data: ${e.message}');
    } catch (e) {
      throw Exception('Unexpected error: $e');
    }
  }

  /// Gửi yêu cầu PATCH
  Future<Response> patch(
    String url, {
    dynamic data,
    Options? options,
  }) async {
    try {
      final headers = await _getHeaders();
      final mergedOptions = options?.copyWith(
            headers: {...?options.headers, ...headers},
          ) ??
          Options(headers: headers);
      final response = await dio.patch(
        url,
        data: data,
        options: mergedOptions,
      );
      return _handleResponse(response);
    } on DioException catch (e) {
      print("errors: $e");
      throw Exception('Failed to patch data: ${e.message}');
    } catch (e) {
      print("errorsc: $e");
      throw Exception('Unexpected error: $e');
    }
  }

  /// Xử lý phản hồi từ server
  Response _handleResponse(Response response) {
    final code = response.statusCode ?? 0;
    if (code >= 200 && code < 300) {
      return response;
    }
    throw Exception('Error: $code - ${response.statusMessage ?? 'Unexpected'}');
  }
}