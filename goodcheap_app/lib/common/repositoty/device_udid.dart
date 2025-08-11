import 'package:shared_preferences/shared_preferences.dart';

class DeviceUdid {
  final SharedPreferences _prefs;

  DeviceUdid(this._prefs);

  // Phương thức khởi tạo bất đồng bộ
  static Future<DeviceUdid> createDeviceUdid() async {
    final SharedPreferences prefs = await SharedPreferences.getInstance();
    return DeviceUdid(prefs);
  }

  // Lưu UDID
  Future<void> saveUdid(String udid) async {
    await _prefs.setString('udid', udid); // Lưu udid
  }

  // Lấy UDID
  Future<String> getUdid() async {
    String? udid = _prefs.getString('udid'); // Lấy udid
    return udid ?? ''; // Trả về udid hoặc chuỗi rỗng
  }

  // Xóa UDID
  Future<void> deleteUdid() async {
    await _prefs.remove('udid'); // Xóa udid
  }
}