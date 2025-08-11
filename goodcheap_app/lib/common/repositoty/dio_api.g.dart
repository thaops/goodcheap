// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'dio_api.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

/// Cung cấp instance DioApi cho các yêu cầu HTTP
@ProviderFor(dioApi)
const dioApiProvider = DioApiProvider._();

/// Cung cấp instance DioApi cho các yêu cầu HTTP
final class DioApiProvider extends $FunctionalProvider<DioApi, DioApi, DioApi>
    with $Provider<DioApi> {
  /// Cung cấp instance DioApi cho các yêu cầu HTTP
  const DioApiProvider._()
    : super(
        from: null,
        argument: null,
        retry: null,
        name: r'dioApiProvider',
        isAutoDispose: true,
        dependencies: null,
        $allTransitiveDependencies: null,
      );

  @override
  String debugGetCreateSourceHash() => _$dioApiHash();

  @$internal
  @override
  $ProviderElement<DioApi> $createElement($ProviderPointer pointer) =>
      $ProviderElement(pointer);

  @override
  DioApi create(Ref ref) {
    return dioApi(ref);
  }

  /// {@macro riverpod.override_with_value}
  Override overrideWithValue(DioApi value) {
    return $ProviderOverride(
      origin: this,
      providerOverride: $SyncValueProvider<DioApi>(value),
    );
  }
}

String _$dioApiHash() => r'924a98f7adafda66a29e01dc46ec10bfa6b8e4f2';

// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member, deprecated_member_use_from_same_package
