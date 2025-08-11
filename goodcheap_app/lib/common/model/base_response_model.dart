class BaseResponseModel {
  int statusCode;
  String message;
  int totalRecord;

  BaseResponseModel({
    required this.statusCode,
    required this.message,
    required this.totalRecord,
  });

  factory BaseResponseModel.fromJson(Map<String, dynamic> json) {
    return BaseResponseModel(
      statusCode: json['StatusCode'],
      message: json['Message'],
      totalRecord: json['TotalRecord'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'StatusCode': statusCode,
      'Message': message,
      'TotalRecord': totalRecord,
    };
  }
}
