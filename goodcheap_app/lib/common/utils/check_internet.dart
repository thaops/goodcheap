import 'package:connectivity_plus/connectivity_plus.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final connectivityProvider = StreamProvider<ConnectivityResult>((ref) {
  return Connectivity().onConnectivityChanged.map((connectivityResults) {
    return connectivityResults.isNotEmpty
        ? connectivityResults.first
        : ConnectivityResult.none;
  });
});