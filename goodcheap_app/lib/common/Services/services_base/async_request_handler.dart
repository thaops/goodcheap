import 'package:flutter_riverpod/legacy.dart';
import 'package:riverpod_annotation/riverpod_annotation.dart';

typedef ApiCall<T> = Future<T> Function();
typedef OnSuccess<T> = FutureOr<void> Function(T response);
typedef OnError = FutureOr<void> Function(Object error, StackTrace stackTrace);

class AsyncRequestHandler extends StateNotifier<AsyncValue<void>> {
  AsyncRequestHandler() : super(const AsyncValue.data(null));

  Future<T?> execute<T>({
     AsyncValue<T>? state,
    required ApiCall<T> apiCall,
    OnSuccess<T>? onSuccess,
    OnError? onError,
    bool rethrowError = true,
    bool cancelPrevious = true,
    bool isSkipLoading = false,
  }) async {

    if (!isSkipLoading) {
      state = const AsyncValue.loading();
    }

    try {
      final response = await apiCall();
      if (!mounted) return response;
      await onSuccess?.call(response);
      return response;
    } catch (e, st) {
      await onError?.call(e, st);
      if (mounted) {
        state = AsyncValue.error(e, st);
      }
      return null;
    }
  }

  @override
  void dispose() {
    super.dispose();
  }
}

final asyncRequestHandlerProvider =
    StateNotifierProvider<AsyncRequestHandler, AsyncValue<void>>(
  (ref) {
    final handler = AsyncRequestHandler();
    ref.onDispose(() {
      handler.dispose();
    });
    return handler;
  },
);
