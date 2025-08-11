import 'dart:io';
import 'package:goodcheap_app/common/repositoty/device_udid.dart';
import 'package:package_info_plus/package_info_plus.dart';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:uuid/uuid.dart';

class DeviceInfo {
  final String udid;
  final String platform;
  final String deviceName;
  final String deviceType;
  final String osVersion;
  final String appId;
  final String appBuild;
  final String appVersion;
  final String pushToken;

  DeviceInfo({
    required this.udid,
    required this.platform,
    required this.deviceName,
    required this.deviceType,
    required this.osVersion,
    required this.appId,
    required this.appBuild,
    required this.appVersion,
    required this.pushToken,
  });
}

class DeviceService {
  static final DeviceService _instance = DeviceService._internal();
  factory DeviceService() => _instance;
  DeviceService._internal();
  final DeviceInfoPlugin _deviceInfoPlugin = DeviceInfoPlugin();
  final Uuid _uuid = Uuid();

  Future<DeviceInfo> getDeviceInfo() async {
    try {
      final packageInfo = await PackageInfo.fromPlatform();
      final udid = await _generateUdid();

      return DeviceInfo(
        udid: udid,
        platform: Platform.isIOS ? "iOS" : "Android",
        deviceName: await _getDeviceName(),
        deviceType: Platform.isIOS ? "iOS" : "Android",
        osVersion: Platform.operatingSystemVersion,
        appId: packageInfo.packageName,
        appBuild: packageInfo.buildNumber,
        appVersion: packageInfo.version,
        pushToken: await _getPushToken(),
      );
    } catch (e) {
      print('Error gathering device info: $e');
      return _getDefaultDeviceInfo();
    }
  }

  Future<String> _generateUdid() async {
    try {
      // Kiểm tra UDID đã lưu sss đó chưa
      final deviceUdid = await DeviceUdid.createDeviceUdid();
      var storedUdid = await deviceUdid.getUdid();
      // Nếu chưa có, tạo UDID mới
      if (storedUdid.isEmpty) {
        storedUdid = _uuid.v4();
        await deviceUdid.saveUdid(storedUdid);
      }
      return storedUdid;
    } catch (e) {
      print('Error generating UDID: $e');
      return _uuid.v4();
    }
  }

  // Các phương thức còn lại giữ nguyên
  Future<String> _getDeviceName() async {
    try {
      if (Platform.isAndroid) {
        final androidInfo = await _deviceInfoPlugin.androidInfo;
        return androidInfo.model;
      } else if (Platform.isIOS) {
        final iosInfo = await _deviceInfoPlugin.iosInfo;
        return iosInfo.name;
      }
    } catch (e) {
      print('Error getting device name: $e');
    }
    return 'Unknown Device';
  }

  Future<String> _getPushToken() async {
    return '';
  }

  DeviceInfo _getDefaultDeviceInfo() {
    return DeviceInfo(
      udid: _uuid.v4(),
      platform: Platform.operatingSystem,
      deviceName: 'Unknown',
      deviceType: 'Unknown',
      osVersion: 'Unknown',
      appId: 'Unknown',
      appBuild: 'Unknown',
      appVersion: 'Unknown',
      pushToken: '',
    );
  }
}
