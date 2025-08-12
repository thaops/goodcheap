---
trigger: always_on
---

Flutter – Riverpod v3 – Clean Architecture
Activation: Always On

1) Kiến trúc & module hóa
Pattern: Clean Architecture + feature-based
lib/features/<feature>/{presentation|application|domain|infrastructure}
Code dùng chung nằm ở lib/core/... (errors, result, di, env, usecases base, network, theme, router, extensions, utils).

Luồng gọi:
UI → Notifier/Controller (application) → UseCase (domain) → Repository → DataSource (infra).
⛔️ Không để UI gọi thẳng repo/datasource.

Tách nhỏ module: Không tạo “god file” > 400 dòng. Vượt ngưỡng → tách.

Model: Mặc định immutable (freezed) + DTO tách riêng (không dùng entity cho JSON).

Import hygiene: Không import chéo giữa các feature; chỉ đi qua core hoặc qua interface. Bật lint cấm import tương hỗ.

2) Riverpod v3 (state management)
Chỉ dùng riverpod, flutter_riverpod, riverpod_annotation, riverpod_generator.

State phức tạp: ưu tiên @riverpod + AsyncValue<T>; tách read/write rõ ràng.

Trong widget: ref.watch/ref.listen. ⛔️ Không ref.read trong build.

Scope & đặt tên provider rõ ràng; tránh autoDispose bừa bãi. Dùng keepAlive() khi cần cache.

Repository được inject qua provider interface (constructor injection), không singleton.

3) Coding style & performance
Bật lints: very_good_analysis (hoặc flutter_lints) và fix toàn bộ warnings trước khi merge.

Pure widgets, const mọi nơi có thể, hạn chế rebuild (select, Consumer hẹp, Key chuẩn).

Màn hình dùng Riverpod: tránh setState; side-effects dùng ref.listen/ref.onDispose.

Network/IO cancelable + timeout; map lỗi về Failure (xem mục 6).

Pagination/Search: AsyncValue<List<T>> + nextPageToken + debounce 250ms và cancel previous.

4) Naming & structure
Widget: XxxScreen, XxxPage, XxxSection, XxxTile

State/Logic: XxxController/XxxNotifier

Domain: XxxEntity | Use case: XxxUseCase | Repo: XxxRepository

Infra: *_repository_impl.dart, *_remote_ds.dart, *_local_ds.dart, *_dto.dart, *_mapper.dart

Extensions: core/extensions — Helpers: core/utils

Ví dụ cây thư mục (feature auth)

bash
Sao chép
Chỉnh sửa
lib/
  core/
    config/app_env.dart
    di/providers.dart
    errors/...
    network/dio_client.dart
    router/app_router.dart
    result/result.dart
    theme/...
    utils/...
  features/
    auth/
      presentation/login_screen.dart
      application/login_controller.dart
      domain/entities/user_entity.dart
      domain/usecases/login_usecase.dart
      domain/repositories/auth_repository.dart
      infrastructure/repositories/auth_repository_impl.dart
      infrastructure/datasources/auth_remote_ds.dart
      infrastructure/models/user_dto.dart
      infrastructure/mappers/user_mapper.dart
5) Composition Root & cấu hình
Env: lib/core/config/app_env.dart (dev/stg/prod) sử dụng --dart-define.

DI: lib/core/di/providers.dart gom providers cấp app.

Rule: Wiring (compose providers, Dio, router, env) chỉ diễn ra ở composition root.

6) Error handling & Result (Dart 3)
Dùng sealed Result/Failure (không throw lên UI; không phụ thuộc dartz).

dart
Sao chép
Chỉnh sửa
// core/result/result.dart
sealed class Failure { const Failure(); }
class NetworkFailure extends Failure { final int? status; const NetworkFailure({this.status}); }
class UnauthorizedFailure extends Failure { const UnauthorizedFailure(); }
class ValidationFailure extends Failure { final String message; const ValidationFailure(this.message); }
class UnknownFailure extends Failure { final Object error; const UnknownFailure(this.error); }

sealed class Result<T> { const Result(); }
class Ok<T> extends Result<T> { final T value; const Ok(this.value); }
class Err<T> extends Result<T> { final Failure failure; const Err(this.failure); }
UseCase trả Result<T>. UI chuyển đổi qua AsyncValue.

7) HTTP/Dio & retry/refresh token
Timeout: connect 10s, receive 20s.

Retry: 0→3 lần, exponential backoff (200/400/800ms) và chỉ áp dụng cho 5xx/429.

Refresh token: interceptor có lock/unlock để gom concurrent 401; một request refresh duy nhất.

Logging: chỉ bật chi tiết ở debug; ⛔️ không log token/PII ở release.

Mapping lỗi: thực hiện ở infra, trả về Failure (⛔️ không đẩy DioException ra domain).

8) DTO/Mapper & dữ liệu
DTO (*_dto.dart) và mapper (*_mapper.dart) tách riêng.

Entity không có fromJson/toJson.

Mapping chỉ ở infrastructure (biến đổi dữ liệu, hợp nhất remote/local).

Caching/Offline (nếu có): secure storage cho token, shared_preferences cho flag nhẹ, DB (Isar/Hive/Drift) cho cache; Repo hợp nhất remote+local (source of truth rõ ràng).

9) UI/UX rules
Mọi AsyncValue phải có loading/success/error + retry khi error.

Navigation tập trung (GoRouter), named routes, params typed. Guard ở presentation. ⛔️ Không push từ domain/infra.

List lớn: ListView.builder/SliverList, item const, AutomaticKeepAliveClientMixin khi cần.

A11y: tôn trọng textScaleFactor, semantics labels.

Ảnh: dùng cacheWidth/height, tránh BoxFit.none.

10) Testing & Tooling
Tối thiểu:

Unit test cho UseCase & Repository (mock Dio bằng mocktail/http_mock_adapter).

Provider test với ProviderContainer + addTearDown.

Widget test cho screen chính; Golden test nếu UI ổn định.

CI bắt buộc:

flutter format --set-exit-if-changed .

flutter analyze

flutter test --coverage

dart run build_runner build --delete-conflicting-outputs

11) Code generation
freezed + json_serializable cho model/DTO.

riverpod_generator cho providers.

Lệnh chuẩn:

bash
Sao chép
Chỉnh sửa
dart run build_runner build --delete-conflicting-outputs
12) Pull Request & Commit
Conventional Commits:

feat(auth): add login usecase

fix(schedule): debounce search

refactor(core): result type

PR checklist:

Đã chạy analyze/test/codegen

Screenshot UI (nếu đổi UI)

Ghi chú performance (nếu có)

Không còn warnings

13) Bảo mật
⛔️ Không log PII/token.

Android: bật R8/proguard; iOS: ATS theo whitelist domain, ⛔️ không allowArbitraryLoads (trừ dev).

Secret chỉ qua env/secure storage; không hard-code.

Phụ lục A — Snippets “drop-in”
A1) analysis_options.yaml (rút gọn)
yaml
Sao chép
Chỉnh sửa
include: package:very_good_analysis/analysis_options.yaml
analyzer:
  exclude:
    - build/**
    - "**/*.g.dart"
    - "**/*.freezed.dart"
  language:
    strict-inference: true
    strict-casts: true
linter:
  rules:
    - always_use_package_imports
    - avoid_dynamic_calls
    - prefer_const_constructors
    - cascade_invocations
    - directives_ordering
A2) UseCase signature (có cancel)
dart
Sao chép
Chỉnh sửa
typedef Cancel = CancelToken;
typedef LoginParams = ({String username, String password});

abstract class LoginUseCase {
  Future<Result<void>> call(LoginParams p, {required Cancel cancel});
}
A3) Controller (AsyncNotifier + hủy request)
dart
Sao chép
Chỉnh sửa
@riverpod
class LoginController extends _$LoginController {
  CancelToken? _cancel;
  @override FutureOr<void> build() => null;

  Future<void> submit(String u, String p) async {
    _cancel?.cancel(); _cancel = CancelToken();
    state = const AsyncLoading();

    final res = await ref.read(loginUseCaseProvider)(
      (username: u, password: p),
      cancel: _cancel!,
    );

    state = switch (res) {
      Ok()  => const AsyncData(null),
      Err(:final failure) =>
        AsyncError(failure, StackTrace.current),
    };

    ref.onDispose(() => _cancel?.cancel());
  }
}
A4) AsyncValue helper cho UI
dart
Sao chép
Chỉnh sửa
extension AsyncX<T> on AsyncValue<T> {
  Widget when3({
    required Widget Function(T) data,
    required Widget Function(Object, StackTrace) error,
    required Widget loading,
  }) => when(data: data, error: error, loading: () => loading);
}
A5) Dio client (ý tưởng cấu hình)
dart
Sao chép
Chỉnh sửa
Dio buildDio(AppEnv env, TokenStore tokenStore) {
  final dio = Dio(BaseOptions(
    baseUrl: env.baseUrl,
    connectTimeout: const Duration(seconds: 10),
    receiveTimeout: const Duration(seconds: 20),
    headers: {'Accept': 'application/json'},
  ));

  // Logging (debug only)
  assert(() {
    dio.interceptors.add(LogInterceptor(
      requestBody: true, responseBody: true,
    ));
    return true;
  }());

  // Auth + Refresh (lock/unlock)
  dio.interceptors.add(QueuedInterceptorsWrapper(
    onRequest: (opt, handler) async {
      final token = await tokenStore.accessToken;
      if (token != null) opt.headers['Authorization'] = 'Bearer $token';
      handler.next(opt);
    },
    onError: (e, handler) async {
      if (e.response?.statusCode == 401) {
        // refresh 1 lần, hàng chờ đợi
        // ... refresh logic ...
        return handler.resolve(await _retry(e.requestOptions, dio));
      }
      handler.next(e);
    },
  ));

  // Retry (5xx/429) với backoff
  dio.interceptors.add(RetryInterceptor(
    retries: 3,
    retryEvaluator: (e) {
      final code = e.response?.statusCode ?? 0;
      return code == 429 || (code >= 500 && code < 600);
    },
    delayCalculator: (a) => Duration(milliseconds: 200 * (1 << a)),
  ));

  return dio;
}