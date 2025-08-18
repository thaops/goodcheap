// lib/features/product_analysis/domain/models/product_analysis.dart

class ProductAnalysis {
  final Map<String, dynamic> data;

  const ProductAnalysis({required this.data});

  factory ProductAnalysis.fromJson(Map<String, dynamic> json) {
    // Nếu backend bọc payload trong key 'data', ưu tiên lấy ra.
    final map = json['data'] is Map<String, dynamic>
        ? json['data'] as Map<String, dynamic>
        : json;
    return ProductAnalysis(data: map);
  }

  /// Truy cập phần giá chi tiết nếu backend trả trong key 'price'.
  PriceBreakdown? get price =>
      PriceBreakdown.tryParse(data['price'] as Map<String, dynamic>?);

  Map<String, dynamic> toJson() => {
    'data': data,
  };
}

/// Giá & chi phí thực trả (out-the-door)
/// Lưu ý: Đây là helper nằm tạm ở domain để giảm thay đổi phạm vi lớn.
/// Về lâu dài, nên tách Entity/DTO theo Clean Architecture (freezed + mapper).
class PriceBreakdown {
  final String? currency; // mã tiền tệ, ví dụ: "VND", "USD"

  /// Giá niêm yết (list price / MSRP)
  final num? listPrice;

  /// Giá đang bán (sale/discounted price)
  final num? salePrice;

  /// Phí vận chuyển (shipping)
  final num? shippingFee;

  /// Thuế/VAT
  final num? taxVat;

  /// Mã giảm giá/khuyến mãi (amount âm để trừ vào tổng)
  final num? couponDiscount;

  /// Các phí khác (nếu có) – tùy chọn
  final num? otherFees;

  /// Tổng "ra cửa" (đã gồm mọi phí/thuế/giảm giá)
  final num? totalOutTheDoor;

  const PriceBreakdown({
    this.currency,
    this.listPrice,
    this.salePrice,
    this.shippingFee,
    this.taxVat,
    this.couponDiscount,
    this.otherFees,
    this.totalOutTheDoor,
  });

  /// Thử parse từ map (an toàn null)
  static PriceBreakdown? tryParse(Map<String, dynamic>? map) {
    if (map == null) return null;
    return PriceBreakdown(
      currency: map['currency'] as String?,
      listPrice: _asNum(map['listPrice']),
      salePrice: _asNum(map['salePrice']),
      shippingFee: _asNum(map['shippingFee']),
      taxVat: _asNum(map['taxVat']),
      couponDiscount: _asNum(map['couponDiscount']),
      otherFees: _asNum(map['otherFees']),
      totalOutTheDoor: _asNum(map['totalOutTheDoor']) ?? _calcTotal(map),
    );
  }

  /// Tính tổng nếu backend chưa trả sẵn totalOutTheDoor.
  /// Công thức: (salePrice hoặc listPrice) + shipping + tax + other - coupon
  static num? _calcTotal(Map<String, dynamic> map) {
    final listPrice = _asNum(map['listPrice']);
    final salePrice = _asNum(map['salePrice']);
    final base = salePrice ?? listPrice;
    if (base == null) return null;

    final shipping = _asNum(map['shippingFee']) ?? 0;
    final tax = _asNum(map['taxVat']) ?? 0;
    final other = _asNum(map['otherFees']) ?? 0;
    final coupon = _asNum(map['couponDiscount']) ?? 0; // giá trị dương → trừ

    return base + shipping + tax + other - coupon;
  }

  static num? _asNum(Object? v) {
    if (v == null) return null;
    if (v is num) return v;
    if (v is String) return num.tryParse(v);
    return null;
  }
}