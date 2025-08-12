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

  Map<String, dynamic> toJson() => {
    'data': data,
  };
}