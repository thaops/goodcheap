// import 'package:flutter/services.dart';
// import 'package:flyteam_mobile/feature/presentation/flight_detail/data/model/supplyform_model.dart';

// class UrovoPrinter {
//   static const MethodChannel _channel = MethodChannel('urovo_printer');

//   Future<String> printGnsa(SupplyFormModel datajson) async {
//     try {
//       final result = await _channel.invokeMethod('printGnsa', {
//         'data': datajson.toJson(),
//       });
//       return result;
//     } on PlatformException catch (e) {
//       print("Failed to print text: '${e.message}'.");
//     }
//     return "";
//   }
  
// }
