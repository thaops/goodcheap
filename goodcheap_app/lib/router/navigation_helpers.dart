// import 'package:flutter/material.dart';
// import 'package:go_router/go_router.dart';
// import 'package:goodcheap_app/router/app_router.dart';

// class Nav {
//   // Switch to tabs (resets stack on that branch)
//   static void goHome(BuildContext context) => context.go(AppRouter.home);
//   static void goFlight(BuildContext context) => context.go(AppRouter.flight);
//   static void goSchedule(BuildContext context) => context.go(AppRouter.schedule);
//   static void goNotice(BuildContext context) => context.go(AppRouter.notice);
//   static void goMore(BuildContext context) => context.go(AppRouter.more);

//   // Nested routes under branches
//   static void goContact(BuildContext context) =>
//       context.go('${AppRouter.more}/${AppRouter.contact}');

//   // Optional push variants if you need stack behavior within a branch
//   static void pushContact(BuildContext context) =>
//       context.push('${AppRouter.more}/${AppRouter.contact}');

//   static void goProfile(BuildContext context) => context.go(AppRouter.profile);
// }
