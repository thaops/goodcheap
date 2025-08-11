// import 'package:flutter/material.dart';
// import 'package:flutter_riverpod/flutter_riverpod.dart';
// import 'package:gnsa/common/Services/services_base/async_request_handler.dart';

// class AsyncHandlerWidget<T> extends ConsumerStatefulWidget {
//   final Future<T> Function() task;
//   final Widget Function(BuildContext, T) successBuilder;
//   final Widget Function(BuildContext, Object, StackTrace)? errorBuilder;
//   final Widget Function(BuildContext)? loadingBuilder;
//   final Widget Function(BuildContext)? idleBuilder;
//   final bool showModalBarrier;
//   final Color? barrierColor;
//   final bool dismissible;
//   final Duration? retryDelay;
//   final int maxRetries;
//   final Widget Function(BuildContext, VoidCallback)? retryBuilder;
//   final bool autoExecute;
//   final VoidCallback? onSuccess;
//   final VoidCallback? onError;

//   const AsyncHandlerWidget({
//     super.key,
//     required this.task,
//     required this.successBuilder,
//     this.errorBuilder,
//     this.loadingBuilder,
//     this.idleBuilder,
//     this.showModalBarrier = true,
//     this.barrierColor,
//     this.dismissible = false,
//     this.retryDelay,
//     this.maxRetries = 3,
//     this.retryBuilder,
//     this.autoExecute = true,
//     this.onSuccess,
//     this.onError,
//   });

//   @override
//   ConsumerState<AsyncHandlerWidget<T>> createState() => _AsyncHandlerWidgetState<T>();
// }

// class _AsyncHandlerWidgetState<T> extends ConsumerState<AsyncHandlerWidget<T>> {
//   late Future<T> _taskFuture;
//   int _retryCount = 0;
//   bool _isInitialLoad = true;

//   @override
//   void initState() {
//     super.initState();
//     if (widget.autoExecute) {
//       _executeTask();
//     }
//   }

//   @override
//   void didUpdateWidget(AsyncHandlerWidget<T> oldWidget) {
//     super.didUpdateWidget(oldWidget);
//     if (widget.task != oldWidget.task && widget.autoExecute) {
//       _executeTask();
//     }
//   }

//   Future<T> _executeTask() async {
//     setState(() {
//       _isInitialLoad = _retryCount == 0;
//       _taskFuture = _performTask();
//     });
//     return _taskFuture;
//   }

//   Future<T> _performTask() async {
//     final handler = ref.read(asyncRequestHandlerProvider.notifier);
//     try {
//       final result = await handler.execute<T>(
//         apiCall: widget.task,
//         onSuccess: (_) {
//           widget.onSuccess?.call();
//           _retryCount = 0; // Reset retry count on success
//         },
//         rethrowError: true,
//       );
//       return result!;
//     } catch (e, st) {
//       widget.onError?.call();
//       if (_retryCount < widget.maxRetries && _shouldRetry(e)) {
//         await Future.delayed(widget.retryDelay ?? const Duration(seconds: 1));
//         _retryCount++;
//         return _performTask(); // Retry
//       }
//       rethrow;
//     }
//   }

//   bool _shouldRetry(Object error) {
//     // Có thể customize logic retry dựa trên loại error
//     return true;
//   }

//   @override
//   Widget build(BuildContext context) {
//     final asyncState = ref.watch(asyncRequestHandlerProvider);

//     return Stack(
//       children: [
//         _buildContent(context, asyncState),

//         if (asyncState.isLoading && widget.showModalBarrier)
//           ModalBarrier(
//             color: widget.barrierColor ?? Colors.black.withOpacity(0.3),
//             dismissible: widget.dismissible,
//           ),
//       ],
//     );
//   }

//   Widget _buildContent(BuildContext context, AsyncValue<void> asyncState) {
//     if (!widget.autoExecute && _isInitialLoad) {
//       return widget.idleBuilder?.call(context) ?? const SizedBox();
//     }

//     return asyncState.when(
//       data: (_) => FutureBuilder<T>(
//         future: _taskFuture,
//         builder: (context, snapshot) {
//           if (snapshot.connectionState == ConnectionState.waiting) {
//             return widget.loadingBuilder?.call(context) ?? _defaultLoading();
//           }
//           if (snapshot.hasError) {
//             return _buildErrorWidget(context, snapshot.error!, snapshot.stackTrace!);
//           }
//           return widget.successBuilder(context, snapshot.data as T);
//         },
//       ),
//       loading: () => widget.loadingBuilder?.call(context) ?? _defaultLoading(),
//       error: (error, stackTrace) => _buildErrorWidget(context, error, stackTrace),
//     );
//   }

//   Widget _buildErrorWidget(BuildContext context, Object error, StackTrace stackTrace) {
//     if (widget.retryBuilder != null) {
//       return widget.retryBuilder!(context, _executeTask);
//     }
//     return widget.errorBuilder?.call(context, error, stackTrace) ?? 
//       _defaultError(error, stackTrace, _executeTask);
//   }

//   Widget _defaultLoading() {
//     return const Center(
//       child: CircularProgressIndicator(),
//     );
//   }

//   Widget _defaultError(Object error, StackTrace stackTrace, VoidCallback onRetry) {
//     return Center(
//       child: Column(
//         mainAxisAlignment: MainAxisAlignment.center,
//         children: [
//           Text('Error: ${error.toString()}'),
//           const SizedBox(height: 16),
//           ElevatedButton(
//             onPressed: onRetry,
//             child: const Text('Retry'),
//           ),
//         ],
//       ),
//     );
//   }
// }