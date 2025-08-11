// import 'package:freezed_annotation/freezed_annotation.dart';

// enum TaskEnum {
//   login,
//   forgotPassword,
//   updateProfile,
//   fetchProfile,
//   refreshToken,
//   detail,
// }

// sealed class BaseStatus{
//   const BaseStatus();
// }
// class Idle extends BaseStatus{
//   const Idle();
// }
// class Loading extends BaseStatus{
//   final TaskEnum task;
//   final String? message;
//   const Loading({required this.task, this.message});
// }
// class Success extends BaseStatus{
//   final TaskEnum task;
//   final String? message;
//   const Success({required this.task, this.message});
// }
// class Error extends BaseStatus{
//   final TaskEnum task;
//   final String message;
//   final StackTrace stackTrace;
//   const Error({required this.task, required this.message, required this.stackTrace});
// }