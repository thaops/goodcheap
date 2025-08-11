
// import 'package:goodcheap_app/router/bottom_navigation_main.dart';
// import 'package:go_router/go_router.dart';

// class AppRouter {
//   static const login = '/login';
//   static const otpDevice = '/otpDevice';
//   static const home = '/home';
//   static const flight = '/flight';
//   static const schedule = '/schedule';
//   static const notice = '/notice';
//   static const more = '/more';
//   static const contact = 'contact';
//   static const contactDetail = 'contactDetail';
//   static const profile = '/profile';
//   static const flightDetail = 'flightDetail';

//   static GoRouter? _router;

//   static GoRouter getRouter(String accessToken) {
//     if (_router != null) return _router!;
//     _router = GoRouter(
//       initialLocation: login,
//       routes: [
//         GoRoute(
//           name: login,
//           path: login,
//           builder: (context, state) => const LoginScreen(),
//         ),
//         GoRoute(
//           name: otpDevice,
//           path: otpDevice,
//           builder: (context, state) => const OtpDeviceView(),
//         ),

//         GoRoute(
//           name: profile,
//           path: profile,
//           builder: (context, state) => const ProfileView(),
//         ),
//         StatefulShellRoute.indexedStack(
//           builder:
//               (context, state, navigationShell) =>
//                   MainScreen(navigationShell: navigationShell),
//           branches: [
//             // Home
//             StatefulShellBranch(
//               routes: [
//                 GoRoute(
//                   path: home,
//                   builder: (context, state) => HomeView(),
//                   routes: [
//                     GoRoute(
//                       path: flightDetail,
//                       name: flightDetail,
//                       builder:
//                           (context, state) =>
//                               const FlightDetailView(),
//                     ),
//                   ],
//                 ),
//               ],
//             ),
//             // Flight
//             StatefulShellBranch(
//               routes: [
//                 GoRoute(
//                   path: flight,
//                   builder:
//                       (context, state) =>
//                           const FlightListScreen(isMyFlight: false),
//                 ),
//               ],
//             ),
//             // Schedule
//             StatefulShellBranch(
//               routes: [
//                 GoRoute(
//                   path: schedule,
//                   builder: (context, state) => const ScheduleView(),
//                 ),
//               ],
//             ),
//             // Notice
//             StatefulShellBranch(
//               routes: [
//                 GoRoute(
//                   path: notice,
//                   builder: (context, state) => const NotificationView(),
//                 ),
//               ],
//             ),
//             // More
//             StatefulShellBranch(
//               routes: [
//                 GoRoute(
//                   path: more,
//                   builder: (context, state) => const MoreView(),
//                   routes: [
//                     GoRoute(
//                       path: contact,
//                       name: contact,
//                       builder: (context, state) => const ContactView(),
//                     ),
//                     GoRoute(
//                       path: contactDetail,
//                       name: contactDetail,
//                       builder: (context, state) => const ContactDetailView(),
//                     ),
//                   ],
//                 ),
//               ],
//             ),
//           ],
//         ),
//       ],
//     );
//     return _router!;
//   }
// }
