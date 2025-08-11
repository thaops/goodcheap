// lib/common/config/api_endpoints.dart
import 'package:goodcheap_app/common/Services/config.dart';

class ApiEndpoints {
  static const String registerDevice = "${Config.baseUrl}/device/register4vnc";
  static const String otpDevice = "${Config.baseUrl}/device/otp4vnc";
//new
//supplyfromdetail
  static String supplyFormAllDetail({String? id}) =>
      "${Config.baseUrl}/supplyform/get-supply-form-detail-by-flight-id-mobile?flightId=$id";
  static String updateSupplyfromItemDetail =
      "${Config.baseUrl}/supplyform/update-item-in-supply-form-mobile";
  static String getSupplyfromItemDetail =
      "${Config.baseUrl}/supplyform/get-item-in-supply-form-mobile";

  //cart
  static String addCart = "${Config.baseUrl}/cart/add-cart-to-supply-form";
  static String getListCart = "${Config.baseUrl}/cart/get-list-cart";

  static String getFlightPreview =
      "${Config.baseUrl}/supplyform/preview-supply-form-in-mobile";
  //signed
  static String getListSignedSupplyForm(String supplyFormDetailId) =>
      "${Config.baseUrl}/supplyform/get-list-signed-supply-form-mobile?supplyFormDetailId=$supplyFormDetailId";
  static String signedSupplyForm =
      "${Config.baseUrl}/supplyform/signed-supply-form-mobile";

  //qr
  static String qr(String flightId) =>
      "${Config.baseUrl}/supplyform/get-qr-code-by-flight-id-mobile?flightId=$flightId";
}
