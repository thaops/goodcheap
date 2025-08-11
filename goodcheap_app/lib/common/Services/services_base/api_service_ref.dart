// Dio API Provider
import 'package:goodcheap_app/common/repositoty/dio_api.dart';
import 'package:hooks_riverpod/hooks_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';

final dioApiProvider = Provider<DioApi>((ref) => DioApi());

// Services Provider
final sharedPreferencesProvider = FutureProvider<SharedPreferences>((ref) async {
  return await SharedPreferences.getInstance();
});